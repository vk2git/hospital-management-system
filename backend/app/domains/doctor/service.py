from asyncpg import Pool
from typing import Optional
import json
from datetime import datetime, timedelta

async def get_doctor_appointments(db: Pool, doctor_id: str) -> list[dict]:
    rows = await db.fetch(
        """
        SELECT a.id, a.patient_id, a.doctor_id,
               pu.first_name || ' ' || pu.last_name AS patient_name,
               a.date, a.time_slot, a.duration_min, a.status, a.share_medical_summary,
               a.reason, a.notes, a.created_at
        FROM appointments a
        JOIN users pu ON a.patient_id = pu.id
        WHERE a.doctor_id = $1
        ORDER BY a.date DESC, a.time_slot DESC
        """,
        doctor_id,
    )
    return [dict(r) for r in rows]

async def complete_appointment(db: Pool, appointment_id: str, doctor_user: dict) -> bool:
    result = await db.execute(
        "UPDATE appointments SET status = 'completed' WHERE id = $1 AND doctor_id = $2 AND status = 'scheduled'",
        appointment_id,
        doctor_user["id"],
    )
    if result == "UPDATE 0":
        return False

    await db.execute("UPDATE payments SET status = 'completed' WHERE appointment_id = $1", appointment_id)

    appt = await db.fetchrow("SELECT patient_id FROM appointments WHERE id = $1", appointment_id)
    if appt:
        await db.execute(
            """
            INSERT INTO notifications (user_id, title, message, type)
            VALUES ($1, 'Appointment Completed', $2, 'appointment')
            """,
            appt["patient_id"],
            f"Your appointment with Dr. {doctor_user['first_name']} {doctor_user['last_name']} has been completed.",
        )
    return True

async def cancel_appointment(db: Pool, appointment_id: str, doctor_user: dict) -> bool:
    appt = await db.fetchrow(
        "SELECT patient_id FROM appointments WHERE id = $1 AND doctor_id = $2 AND status = 'scheduled'",
        appointment_id,
        doctor_user["id"],
    )
    if not appt:
        return False

    await db.execute("UPDATE appointments SET status = 'cancelled' WHERE id = $1", appointment_id)
    await db.execute("UPDATE payments SET status = 'refunded' WHERE appointment_id = $1", appointment_id)

    await db.execute(
        """
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, 'Appointment Cancelled by Doctor', $2, 'appointment')
        """,
        appt["patient_id"],
        f"Dr. {doctor_user['first_name']} {doctor_user['last_name']} has cancelled your appointment. Please reschedule.",
    )
    return True

async def reassign_appointment(db: Pool, appointment_id: str, new_doctor_id: str, doctor_user: dict) -> dict:
    appt = await db.fetchrow(
        "SELECT patient_id, date, time_slot FROM appointments WHERE id = $1 AND doctor_id = $2 AND status = 'scheduled'",
        appointment_id, doctor_user["id"],
    )
    if not appt:
        return {"error": "not_found", "msg": "Appointment not found"}

    new_doc = await db.fetchrow(
        "SELECT u.first_name, u.last_name FROM users u WHERE u.id = $1 AND u.role = 'doctor' AND u.is_active = TRUE",
        new_doctor_id,
    )
    if not new_doc:
        return {"error": "not_found", "msg": "Target doctor not found"}

    existing = await db.fetchrow(
        """
        SELECT id FROM appointments
        WHERE doctor_id = $1 AND date = $2 AND time_slot = $3 AND status IN ('scheduled', 'rescheduled')
        """,
        new_doctor_id, appt["date"], appt["time_slot"],
    )
    if existing:
        return {"error": "conflict", "msg": "The target doctor is not available at this time slot"}

    await db.execute(
        "UPDATE appointments SET doctor_id = $1, status = 'rescheduled' WHERE id = $2",
        new_doctor_id, appointment_id,
    )

    await db.execute(
        """
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, 'Appointment Reassigned', $2, 'appointment')
        """,
        appt["patient_id"],
        f"Your appointment has been reassigned to Dr. {new_doc['first_name']} {new_doc['last_name']}.",
    )
    await db.execute(
        """
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, 'Appointment Transferred to You', $2, 'appointment')
        """,
        new_doctor_id,
        f"Dr. {doctor_user['first_name']} {doctor_user['last_name']} has transferred an appointment to you.",
    )
    return {"success": True}

async def list_patients(db: Pool, doctor_id: str, search: Optional[str] = None) -> list[dict]:
    import uuid
    doctor_uuid = uuid.UUID(doctor_id)
    if search:
        rows = await db.fetch(
            """
            SELECT DISTINCT u.id, u.email, u.first_name, u.last_name, u.phone
            FROM users u
            JOIN appointments a ON a.patient_id = u.id
            WHERE a.doctor_id = $1 AND u.role = 'patient'
              AND (u.first_name ILIKE $2 OR u.last_name ILIKE $2 OR u.email ILIKE $2)
              AND NOT EXISTS (
                  SELECT 1 FROM patient_hospital_privacy php
                  JOIN user_hospitals duh ON php.hospital_id = duh.hospital_id
                  WHERE php.patient_id = u.id AND duh.user_id = $1
              )
            ORDER BY u.first_name
            """,
            doctor_uuid, f"%{search}%",
        )
    else:
        rows = await db.fetch(
            """
            SELECT DISTINCT u.id, u.email, u.first_name, u.last_name, u.phone
            FROM users u
            JOIN appointments a ON a.patient_id = u.id
            WHERE a.doctor_id = $1 AND u.role = 'patient'
              AND NOT EXISTS (
                  SELECT 1 FROM patient_hospital_privacy php
                  JOIN user_hospitals duh ON php.hospital_id = duh.hospital_id
                  WHERE php.patient_id = u.id AND duh.user_id = $1
              )
            ORDER BY u.first_name
            """,
            doctor_uuid,
        )
    return [dict(r) for r in rows]

async def get_patient_records(db: Pool, doctor_id: str, patient_id: str) -> list[dict]:
    import uuid
    doctor_uuid = uuid.UUID(doctor_id)
    patient_uuid = uuid.UUID(patient_id)

    has_appt = await db.fetchrow(
        """
        SELECT id FROM appointments 
        WHERE patient_id = $1 AND doctor_id = $2 
          AND NOT EXISTS (
              SELECT 1 FROM patient_hospital_privacy php
              JOIN user_hospitals duh ON php.hospital_id = duh.hospital_id
              WHERE php.patient_id = $1 AND duh.user_id = $2
          )
        LIMIT 1
        """,
        patient_uuid, doctor_uuid,
    )
    if not has_appt:
        return []

    rows = await db.fetch(
        """
        SELECT mr.id, mr.patient_id, mr.doctor_id,
               u.first_name || ' ' || u.last_name AS doctor_name,
               mr.appointment_id, mr.diagnosis, mr.symptoms,
               mr.notes, mr.ai_summary, mr.created_at
        FROM medical_records mr
        LEFT JOIN users u ON mr.doctor_id = u.id
        WHERE mr.patient_id = $1
        ORDER BY mr.created_at DESC
        """,
        patient_uuid,
    )
    return [dict(r) for r in rows]

async def create_medical_record(db: Pool, doctor_user: dict, req: dict) -> dict:
    row = await db.fetchrow(
        """
        INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, symptoms, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at
        """,
        req["patient_id"], doctor_user["id"], req["appointment_id"], req["diagnosis"], req["symptoms"], req["notes"],
    )

    await db.execute(
        """
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, 'New Medical Record', $2, 'system')
        """,
        req["patient_id"],
        f"Dr. {doctor_user['first_name']} {doctor_user['last_name']} has added a new medical record.",
    )
    return dict(row)

async def get_doctor_prescriptions(db: Pool, doctor_id: str) -> list[dict]:
    rows = await db.fetch(
        """
        SELECT p.id, p.medical_record_id, p.patient_id,
               pu.first_name || ' ' || pu.last_name AS patient_name,
               p.doctor_id,
               p.medications, p.instructions, p.is_ai_generated, p.created_at
        FROM prescriptions p
        JOIN users pu ON p.patient_id = pu.id
        WHERE p.doctor_id = $1
        ORDER BY p.created_at DESC
        """,
        doctor_id,
    )
    return [dict(r) for r in rows]

async def create_prescription(db: Pool, doctor_user: dict, req: dict, is_ai: bool = False) -> dict:
    meds_json = json.dumps(req["medications"])
    row = await db.fetchrow(
        """
        INSERT INTO prescriptions (patient_id, doctor_id, medical_record_id, medications, instructions, is_ai_generated)
        VALUES ($1, $2, $3, $4::jsonb, $5, $6)
        RETURNING id, created_at
        """,
        req["patient_id"], doctor_user["id"], req["medical_record_id"], meds_json, req["instructions"], is_ai,
    )

    await db.execute(
        """
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, 'New Prescription', $2, 'prescription')
        """,
        req["patient_id"],
        f"Dr. {doctor_user['first_name']} {doctor_user['last_name']} has issued a new prescription for you.",
    )
    return dict(row)

async def ai_generate_prescription(db: Pool, doctor_user: dict, req: dict) -> dict:
    from app.ai.ollama_client import generate_prescription_ai
    ai_result = await generate_prescription_ai(
        diagnosis=req["diagnosis"], symptoms=req["symptoms"], patient_info=req["patient_info"] or "",
    )
    req["medications"] = ai_result.get("medications", [])
    req["instructions"] = ai_result.get("instructions", "Generated by AI.")
    
    row = await create_prescription(db, doctor_user, req, is_ai=True)
    row["medications"] = req["medications"]
    row["instructions"] = req["instructions"]
    return row

async def smart_search(db: Pool, doctor_id: str, query: str) -> dict:
    import uuid
    doctor_uuid = uuid.UUID(doctor_id)
    try:
        from app.ai.ollama_client import smart_search_patients
        results = await smart_search_patients(query, doctor_id, db)
        
        # Post-filter AI-generated SQL results in Python for strict privacy compliance
        allowed_results = []
        for r in results.get("results", []):
            patient_id_val = r.get("id") or r.get("user_id") or r.get("patient_id")
            if patient_id_val:
                try:
                    patient_uuid = uuid.UUID(patient_id_val)
                    hidden = await db.fetchrow(
                        """
                        SELECT 1 FROM patient_hospital_privacy php
                        JOIN user_hospitals duh ON php.hospital_id = duh.hospital_id
                        WHERE php.patient_id = $1 AND duh.user_id = $2
                        """,
                        patient_uuid, doctor_uuid
                    )
                    if not hidden:
                        allowed_results.append(r)
                except Exception:
                    # Skip or keep if not parseable as UUID
                    pass
            else:
                allowed_results.append(r)
        results["results"] = allowed_results
        return results
    except Exception:
        rows = await db.fetch(
            """
            SELECT DISTINCT u.id, u.email, u.first_name, u.last_name, u.phone,
                   a.date, a.time_slot, a.status, mr.diagnosis
            FROM users u
            JOIN appointments a ON a.patient_id = u.id
            LEFT JOIN medical_records mr ON mr.patient_id = u.id
            WHERE a.doctor_id = $1 AND u.role = 'patient'
              AND (u.first_name ILIKE $2 OR u.last_name ILIKE $2
                   OR u.email ILIKE $2 OR COALESCE(mr.diagnosis, '') ILIKE $2)
              AND NOT EXISTS (
                  SELECT 1 FROM patient_hospital_privacy php
                  JOIN user_hospitals duh ON php.hospital_id = duh.hospital_id
                  WHERE php.patient_id = u.id AND duh.user_id = $1
              )
            ORDER BY u.first_name
            LIMIT 50
            """,
            doctor_uuid, f"%{query}%",
        )
        return {
            "results": [{"id": str(r["id"]), "email": r["email"], "first_name": r["first_name"], "last_name": r["last_name"], "phone": r["phone"], "last_visit": str(r["date"]) if r["date"] else None, "diagnosis": r["diagnosis"]} for r in rows],
            "interpreted_query": f"Text search (with privacy filters): {query}"
        }

async def list_other_doctors(db: Pool, doctor_id: str) -> list[dict]:
    rows = await db.fetch(
        """
        SELECT dp.id, dp.user_id, u.first_name, u.last_name,
               dp.specialization, dp.qualification, dp.experience_years,
               dp.consultation_fee, dp.available_days
        FROM doctor_profiles dp
        JOIN users u ON dp.user_id = u.id
        WHERE u.is_active = TRUE AND u.id != $1
        ORDER BY u.first_name
        """,
        doctor_id,
    )
    return [dict(r) for r in rows]

async def get_shared_patient_summary(db: Pool, doctor_id: str, appointment_id: str) -> dict:
    appt = await db.fetchrow(
        """
        SELECT patient_id, date, time_slot, share_medical_summary 
        FROM appointments 
        WHERE id = $1 AND doctor_id = $2
        """, 
        appointment_id, doctor_id
    )
    if not appt:
        return {"error": "not_found", "msg": "Appointment not found"}
    if not appt["share_medical_summary"]:
        return {"error": "forbidden", "msg": "Patient has not shared their medical summary"}

    appt_datetime = datetime.combine(appt["date"], appt["time_slot"])
    now = datetime.now()
    buffer = timedelta(minutes=30)
    end_time = appt_datetime + timedelta(hours=24)

    if now < appt_datetime - buffer:
        return {"error": "forbidden", "msg": "Too early to view summary. You can view it starting 30 minutes before the appointment."}
    if now > end_time:
        return {"error": "forbidden", "msg": "Access expired. You can only view the summary up to 24 hours after the appointment."}

    from app.domains.patient.service import get_medical_records_summary
    summary = await get_medical_records_summary(db, str(appt["patient_id"]))
    return {"summary": summary}
