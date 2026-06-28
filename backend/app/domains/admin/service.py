from asyncpg import Pool
from typing import Optional
from app.core.security import hash_password

async def list_account_requests(db: Pool, status: Optional[str] = None) -> list[dict]:
    query = """
        SELECT ar.id, ar.user_id, u.email AS user_email,
               u.first_name || ' ' || u.last_name AS user_name,
               u.role AS user_role,
               ar.type, ar.status, ar.admin_notes,
               ar.created_at, ar.resolved_at
        FROM account_requests ar
        JOIN users u ON ar.user_id = u.id
    """
    if status:
        query += " WHERE ar.status = $1 ORDER BY ar.created_at DESC"
        rows = await db.fetch(query, status)
    else:
        query += " ORDER BY ar.created_at DESC"
        rows = await db.fetch(query)
    return [dict(r) for r in rows]

async def get_pending_request(db: Pool, request_id: str) -> Optional[dict]:
    req = await db.fetchrow(
        "SELECT * FROM account_requests WHERE id = $1 AND status = 'pending'",
        request_id,
    )
    return dict(req) if req else None

async def approve_password_reset(db: Pool, request_id: str, user_id: str, new_password: str, admin_notes: Optional[str]) -> None:
    await db.execute(
        "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
        hash_password(new_password),
        user_id,
    )
    await db.execute(
        """
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, 'Password Reset Approved',
                'Your password has been reset by the administrator. Please log in with your new password.',
                'system')
        """,
        user_id,
    )
    await db.execute(
        """
        UPDATE account_requests
        SET status = 'approved', admin_notes = $1, resolved_at = NOW()
        WHERE id = $2
        """,
        admin_notes,
        request_id,
    )

async def approve_account_deletion(db: Pool, request_id: str, user_id: str, admin_notes: Optional[str]) -> None:
    await db.execute(
        "UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = $1",
        user_id,
    )
    await db.execute(
        """
        UPDATE account_requests
        SET status = 'approved', admin_notes = $1, resolved_at = NOW()
        WHERE id = $2
        """,
        admin_notes,
        request_id,
    )

async def reject_request(db: Pool, req: dict, admin_notes: Optional[str]) -> None:
    await db.execute(
        """
        UPDATE account_requests
        SET status = 'rejected', admin_notes = $1, resolved_at = NOW()
        WHERE id = $2
        """,
        admin_notes,
        req["id"],
    )
    reason = f" Reason: {admin_notes}" if admin_notes else ""
    await db.execute(
        """
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, $2, $3, 'system')
        """,
        req["user_id"],
        f"{req['type'].replace('_', ' ').title()} Request Rejected",
        f"Your {req['type'].replace('_', ' ')} request has been rejected by the administrator.{reason}",
    )

async def list_users(db: Pool, role: Optional[str] = None, admin_hospital_id: Optional[str] = None) -> list[dict]:
    import uuid
    admin_hospital_uuid = uuid.UUID(admin_hospital_id) if admin_hospital_id else None

    # Filter out patients who hid their data from the calling hospital admin
    query = """
        SELECT DISTINCT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.created_at,
               h.name AS hospital_name
        FROM users u
        LEFT JOIN user_hospitals uh ON u.id = uh.user_id
        LEFT JOIN hospitals h ON uh.hospital_id = h.id
        WHERE ($1::varchar IS NULL OR u.role::varchar = $1)
          AND ($2::uuid IS NULL OR u.role::varchar != 'patient' OR NOT EXISTS (
              SELECT 1 FROM patient_hospital_privacy php
              WHERE php.patient_id = u.id AND php.hospital_id = $2
          ))
        ORDER BY u.created_at DESC
    """
    rows = await db.fetch(query, role, admin_hospital_uuid)
    return [dict(r) for r in rows]


async def check_approved_deletion(db: Pool, user_id: str) -> bool:
    row = await db.fetchrow(
        """
        SELECT id FROM account_requests
        WHERE user_id = $1 AND type = 'account_deletion' AND status = 'approved'
        """,
        user_id,
    )
    return bool(row)

async def get_user_role(db: Pool, user_id: str) -> Optional[str]:
    row = await db.fetchrow("SELECT role FROM users WHERE id = $1", user_id)
    return row["role"] if row else None

async def delete_user(db: Pool, user_id: str) -> None:
    await db.execute("DELETE FROM users WHERE id = $1", user_id)

async def list_doctors(db: Pool) -> list[dict]:
    rows = await db.fetch(
        """
        SELECT dp.id, dp.user_id, u.first_name, u.last_name,
               dp.specialization, dp.qualification, dp.experience_years,
               dp.consultation_fee, dp.available_days
        FROM doctor_profiles dp
        JOIN users u ON dp.user_id = u.id
        ORDER BY u.first_name
        """
    )
    return [dict(r) for r in rows]

async def check_email_exists(db: Pool, email: str) -> bool:
    row = await db.fetchrow("SELECT id FROM users WHERE email = $1", email)
    return bool(row)

async def create_doctor(db: Pool, doctor_data: dict) -> dict:
    new_user = await db.fetchrow(
        """
        INSERT INTO users (email, password_hash, first_name, last_name, role)
        VALUES ($1, $2, $3, $4, 'doctor')
        RETURNING id, first_name, last_name
        """,
        doctor_data["email"],
        hash_password(doctor_data["password"]),
        doctor_data["first_name"],
        doctor_data["last_name"],
    )

    doctor = await db.fetchrow(
        """
        INSERT INTO doctor_profiles (user_id, specialization, qualification, experience_years, consultation_fee, available_days)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        """,
        new_user["id"],
        doctor_data["specialization"],
        doctor_data["qualification"],
        doctor_data["experience_years"],
        doctor_data["consultation_fee"],
        doctor_data["available_days"],
    )

    return {
        "id": str(doctor["id"]),
        "user_id": str(new_user["id"]),
        "first_name": new_user["first_name"],
        "last_name": new_user["last_name"],
    }

async def get_system_stats(db: Pool) -> dict:
    users_by_role = await db.fetch("SELECT role, COUNT(*) as count FROM users GROUP BY role")
    appointments_by_status = await db.fetch("SELECT status, COUNT(*) as count FROM appointments GROUP BY status")
    
    return {
        "total_users": await db.fetchval("SELECT COUNT(*) FROM users"),
        "total_appointments": await db.fetchval("SELECT COUNT(*) FROM appointments"),
        "total_prescriptions": await db.fetchval("SELECT COUNT(*) FROM prescriptions"),
        "total_payments": await db.fetchval("SELECT COALESCE(SUM(amount), 0) FROM payments"),
        "users_by_role": [dict(r) for r in users_by_role],
        "appointments_by_status": [dict(r) for r in appointments_by_status],
        "pending_requests": await db.fetchval("SELECT COUNT(*) FROM account_requests WHERE status = 'pending'"),
    }

async def list_hospitals(db: Pool) -> list[dict]:
    rows = await db.fetch("SELECT * FROM hospitals ORDER BY created_at DESC")
    return [dict(r) for r in rows]

async def create_hospital(db: Pool, data: dict) -> dict:
    row = await db.fetchrow(
        """
        INSERT INTO hospitals (name, address, contact_email, contact_phone)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        """,
        data["name"], data.get("address"), data.get("contact_email"), data.get("contact_phone")
    )
    return dict(row)

async def create_hospital_role(db: Pool, data: dict) -> dict:
    # Check if user exists
    user = await db.fetchrow("SELECT id FROM users WHERE email = $1", data["email"])
    if not user:
        user = await db.fetchrow(
            """
            INSERT INTO users (email, first_name, last_name, phone, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            """,
            data["email"], data["first_name"], data["last_name"], data.get("phone"), data["role"]
        )
        # If staff, create staff_profile
        if data["role"] in ["staff", "head_of_staff"]:
            await db.execute(
                "INSERT INTO staff_profiles (user_id, role_title, is_head) VALUES ($1, $2, $3)",
                user["id"], "Staff", data["role"] == "head_of_staff"
            )
        # If doctor, create doctor_profile
        elif data["role"] in ["doctor", "head_of_doctor"]:
            await db.execute(
                "INSERT INTO doctor_profiles (user_id, specialization) VALUES ($1, 'General')",
                user["id"]
            )
    else:
        # If user exists, we might want to update their role if it's changing globally? 
        # The prompt says "the user can use the same profile in other hospital".
        # If they are already a doctor, maybe they can be head_of_doctor in another hospital?
        # For simplicity, let's keep their global role unchanged if they exist, or update it if it's an "upgrade".
        pass
    
    # Link to hospital
    await db.execute(
        "INSERT INTO user_hospitals (user_id, hospital_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        user["id"], data["hospital_id"]
    )
    return {"user_id": str(user["id"]), "hospital_id": data["hospital_id"]}

