import secrets
from datetime import datetime, date as date_type, time, timedelta, timezone
from asyncpg import Pool
import json
from typing import Optional

async def list_doctors(db: Pool, patient_id: Optional[str] = None) -> list[dict]:
    import uuid
    patient_uuid = uuid.UUID(patient_id) if patient_id else None
    rows = await db.fetch(
        """
        SELECT DISTINCT dp.id, dp.user_id, u.first_name, u.last_name,
               dp.specialization, dp.qualification, dp.experience_years,
               dp.consultation_fee, dp.available_days
        FROM doctor_profiles dp
        JOIN users u ON dp.user_id = u.id
        LEFT JOIN user_hospitals uh ON u.id = uh.user_id
        WHERE u.is_active = TRUE
          AND ($1::uuid IS NULL OR uh.hospital_id IS NULL OR NOT EXISTS (
              SELECT 1 FROM patient_hospital_privacy php
              WHERE php.patient_id = $1 AND php.hospital_id = uh.hospital_id
          ))
        ORDER BY u.first_name
        """,
        patient_uuid
    )
    return [dict(r) for r in rows]

async def get_time_slots(db: Pool, doctor_id: str, date_str: str) -> dict:
    try:
        appointment_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return {"error": "invalid_date", "msg": "Invalid date format. Use YYYY-MM-DD"}

    today = date_type.today()
    if appointment_date < today:
        return {"error": "past_date", "msg": "Cannot select a past date"}

    doc = await db.fetchrow(
        "SELECT dp.slot_duration_min FROM doctor_profiles dp JOIN users u ON dp.user_id = u.id WHERE dp.user_id = $1 AND u.is_active = TRUE",
        doctor_id,
    )
    if not doc:
        return {"error": "not_found", "msg": "Doctor not found"}

    duration = doc["slot_duration_min"] or 30
    all_slots = []
    current = time(9, 0)
    end = time(17, 0)
    while current < end:
        all_slots.append(current.strftime("%H:%M"))
        minutes = current.hour * 60 + current.minute + duration
        if minutes >= 17 * 60:
            break
        current = time(minutes // 60, minutes % 60)

    if appointment_date == today:
        now = datetime.now().time()
        all_slots = [s for s in all_slots if time.fromisoformat(s) > now]

    booked = await db.fetch(
        """
        SELECT time_slot FROM appointments
        WHERE doctor_id = $1 AND date = $2 AND status IN ('scheduled', 'rescheduled')
        """,
        doctor_id,
        appointment_date,
    )
    booked_strs = {r["time_slot"].strftime("%H:%M") for r in booked}
    available = [s for s in all_slots if s not in booked_strs]

    return {"slots": available}

async def get_appointments(db: Pool, patient_id: str) -> list[dict]:
    rows = await db.fetch(
        """
        SELECT a.id, a.patient_id, a.doctor_id,
               u.first_name || ' ' || u.last_name AS doctor_name,
               dp.specialization,
               a.date, a.time_slot, a.duration_min, a.status, a.share_medical_summary,
               a.reason, a.notes, a.created_at
        FROM appointments a
        JOIN users u ON a.doctor_id = u.id
        JOIN doctor_profiles dp ON dp.user_id = u.id
        WHERE a.patient_id = $1
        ORDER BY a.date DESC, a.time_slot DESC
        """,
        patient_id,
    )
    return [dict(r) for r in rows]

async def book_appointment(db: Pool, patient_user: dict, req: dict) -> dict:
    import uuid
    patient_uuid = uuid.UUID(str(patient_user["id"]))
    doctor_uuid = uuid.UUID(req["doctor_id"])

    # Check if doctor belongs to a hospital hidden by the patient
    doctor_hospitals = await db.fetch("SELECT hospital_id FROM user_hospitals WHERE user_id = $1", doctor_uuid)
    for h in doctor_hospitals:
        hidden = await db.fetchrow(
            "SELECT 1 FROM patient_hospital_privacy WHERE patient_id = $1 AND hospital_id = $2",
            patient_uuid, h["hospital_id"]
        )
        if hidden:
            return {"error": "forbidden", "msg": "Cannot book appointments at a hospital where you have hidden your details"}

    doc = await db.fetchrow(
        """
        SELECT dp.id, dp.consultation_fee, u.first_name, u.last_name, dp.specialization
        FROM doctor_profiles dp
        JOIN users u ON dp.user_id = u.id
        WHERE dp.user_id = $1 AND u.is_active = TRUE
        """,
        req["doctor_id"],
    )
    if not doc:
        return {"error": "not_found", "msg": "Doctor not found"}

    try:
        slot_time = datetime.strptime(req["time_slot"], "%H:%M").time()
    except ValueError:
        return {"error": "invalid_time", "msg": "Invalid time format. Use HH:MM"}

    existing = await db.fetchrow(
        """
        SELECT id FROM appointments
        WHERE doctor_id = $1 AND date = $2 AND time_slot = $3 AND status IN ('scheduled', 'rescheduled')
        """,
        req["doctor_id"], req["date"], slot_time,
    )
    if existing:
        return {"error": "conflict", "msg": "This time slot is already booked"}

    row = await db.fetchrow(
        """
        INSERT INTO appointments (patient_id, doctor_id, date, time_slot, reason, share_medical_summary)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at
        """,
        patient_user["id"], req["doctor_id"], req["date"], slot_time, req["reason"], req.get("share_medical_summary", False),
    )

    if doc["consultation_fee"] and float(doc["consultation_fee"]) > 0:
        await db.execute(
            """
            INSERT INTO payments (patient_id, appointment_id, amount, description)
            VALUES ($1, $2, $3, $4)
            """,
            patient_user["id"], row["id"], doc["consultation_fee"], f"Consultation with Dr. {doc['first_name']} {doc['last_name']}",
        )

    await db.execute(
        """
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, 'New Appointment', $2, 'appointment')
        """,
        req["doctor_id"],
        f"{patient_user['first_name']} {patient_user['last_name']} booked an appointment on {req['date']} at {req['time_slot']}.",
    )

    return {
        "id": str(row["id"]), "patient_id": str(patient_user["id"]), "doctor_id": req["doctor_id"],
        "doctor_name": f"{doc['first_name']} {doc['last_name']}", "specialization": doc["specialization"],
        "date": str(req["date"]), "time_slot": req["time_slot"], "status": "scheduled",
        "reason": req["reason"], "share_medical_summary": req.get("share_medical_summary", False), "created_at": str(row["created_at"]) if row["created_at"] else None,
    }

async def cancel_appointment(db: Pool, appointment_id: str, patient_user: dict) -> bool:
    appt = await db.fetchrow(
        "SELECT id, doctor_id FROM appointments WHERE id = $1 AND patient_id = $2 AND status = 'scheduled'",
        appointment_id, patient_user["id"],
    )
    if not appt:
        return False

    await db.execute("UPDATE appointments SET status = 'cancelled' WHERE id = $1", appointment_id)
    await db.execute("UPDATE payments SET status = 'refunded' WHERE appointment_id = $1", appointment_id)

    await db.execute(
        """
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, 'Appointment Cancelled', $2, 'appointment')
        """,
        appt["doctor_id"], f"{patient_user['first_name']} {patient_user['last_name']} cancelled their appointment.",
    )
    return True

async def get_medical_records(db: Pool, patient_id: str) -> list[dict]:
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
        patient_id,
    )
    return [dict(r) for r in rows]

async def get_medical_records_summary(db: Pool, patient_id: str) -> str:
    rows = await db.fetch(
        """
        SELECT created_at, diagnosis, symptoms, notes
        FROM medical_records
        WHERE patient_id = $1
        ORDER BY created_at DESC
        LIMIT 20
        """,
        patient_id,
    )
    if not rows:
        return "No medical records found."

    from app.ai.ollama_client import medical_record_summary
    return await medical_record_summary([dict(r) for r in rows])

async def get_prescriptions(db: Pool, patient_id: str) -> list[dict]:
    rows = await db.fetch(
        """
        SELECT p.id, p.medical_record_id, p.patient_id, p.doctor_id,
               u.first_name || ' ' || u.last_name AS doctor_name,
               p.medications, p.instructions, p.is_ai_generated, p.created_at
        FROM prescriptions p
        LEFT JOIN users u ON p.doctor_id = u.id
        WHERE p.patient_id = $1
        ORDER BY p.created_at DESC
        """,
        patient_id,
    )
    return [dict(r) for r in rows]

async def share_prescription(db: Pool, prescription_id: str, patient_id: str) -> Optional[dict]:
    presc = await db.fetchrow("SELECT id FROM prescriptions WHERE id = $1 AND patient_id = $2", prescription_id, patient_id)
    if not presc:
        return None

    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)

    await db.execute(
        """
        UPDATE prescriptions
        SET pharmacy_access_token = $1, pharmacy_access_expires = $2
        WHERE id = $3
        """,
        token, expires, prescription_id,
    )
    return {"access_token": token, "expires_at": expires.isoformat()}

async def get_payments(db: Pool, patient_id: str) -> list[dict]:
    rows = await db.fetch(
        """
        SELECT id, patient_id, appointment_id, amount, status,
               method, description, created_at
        FROM payments
        WHERE patient_id = $1
        ORDER BY created_at DESC
        """,
        patient_id,
    )
    return [dict(r) for r in rows]

async def get_profile(db: Pool, user_id: str) -> Optional[dict]:
    profile = await db.fetchrow("SELECT * FROM patient_profiles WHERE user_id = $1", user_id)
    return dict(profile) if profile else None

async def update_profile(db: Pool, user_id: str, updates: dict) -> None:
    # Handle user updates
    u_updates, u_params = [], []
    idx = 1
    for f in ["first_name", "last_name", "phone"]:
        if f in updates and updates[f] is not None:
            u_updates.append(f"{f} = ${idx}")
            u_params.append(updates[f])
            idx += 1
    if u_updates:
        u_params.append(user_id)
        await db.execute(f"UPDATE users SET {', '.join(u_updates)}, updated_at = NOW() WHERE id = ${idx}", *u_params)

    # Handle profile updates
    p_updates, p_params = [], []
    idx = 1
    for f in ["date_of_birth", "gender", "blood_group", "address", "emergency_contact", "insurance_id"]:
        if f in updates and updates[f] is not None:
            p_updates.append(f"{f} = ${idx}")
            p_params.append(updates[f])
            idx += 1
    if p_updates:
        p_params.append(user_id)
        await db.execute(f"UPDATE patient_profiles SET {', '.join(p_updates)} WHERE user_id = ${idx}", *p_params)


async def list_patient_hospitals(db: Pool, patient_id: str) -> list[dict]:
    import uuid
    patient_uuid = uuid.UUID(patient_id)
    rows = await db.fetch(
        """
        SELECT h.id, h.name, 
               EXISTS (
                   SELECT 1 FROM patient_hospital_privacy php
                   WHERE php.patient_id = $1 AND php.hospital_id = h.id
               ) AS is_hidden
        FROM hospitals h
        WHERE h.is_active = TRUE
        ORDER BY h.name
        """,
        patient_uuid
    )
    return [dict(r) for r in rows]


async def update_patient_hospital_privacy(db: Pool, patient_id: str, hospital_id: str, is_hidden: bool) -> None:
    import uuid
    patient_uuid = uuid.UUID(patient_id)
    hospital_uuid = uuid.UUID(hospital_id)
    if is_hidden:
        await db.execute(
            """
            INSERT INTO patient_hospital_privacy (patient_id, hospital_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            """,
            patient_uuid, hospital_uuid
        )
    else:
        await db.execute(
            """
            DELETE FROM patient_hospital_privacy
            WHERE patient_id = $1 AND hospital_id = $2
            """,
            patient_uuid, hospital_uuid
        )

async def toggle_appointment_sharing(db: Pool, appointment_id: str, patient_id: str, share: bool) -> bool:
    res = await db.execute(
        "UPDATE appointments SET share_medical_summary = $1 WHERE id = $2 AND patient_id = $3",
        share, appointment_id, patient_id
    )
    return res == "UPDATE 1"
