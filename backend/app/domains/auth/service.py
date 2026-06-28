from asyncpg import Pool
from typing import Optional
from app.core.security import hash_password, verify_password

async def check_email_exists(db: Pool, email: str) -> bool:
    row = await db.fetchrow("SELECT id FROM users WHERE email = $1", email)
    return bool(row)

async def check_email_status(db: Pool, email: str) -> tuple[bool, bool]:
    row = await db.fetchrow("SELECT password_hash FROM users WHERE email = $1", email)
    if not row:
        return False, False
    return True, row["password_hash"] is None


async def register_patient(db: Pool, req: dict) -> str:
    user = await db.fetchrow(
        """
        INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
        VALUES ($1, $2, $3, $4, $5, 'patient')
        RETURNING id
        """,
        req["email"], hash_password(req["password"]), req["first_name"], req["last_name"], req.get("phone"),
    )

    await db.execute(
        """
        INSERT INTO patient_profiles (user_id, date_of_birth, gender, blood_group)
        VALUES ($1, $2, $3, $4)
        """,
        user["id"], req.get("date_of_birth"), req.get("gender"), req.get("blood_group"),
    )

    await db.execute(
        """
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ($1, 'Welcome to Rising Hospital!',
                'Your patient account has been created. You can now book appointments and manage your health records.',
                'system')
        """,
        user["id"],
    )
    return str(user["id"])

async def set_user_password(db: Pool, email: str, password: str) -> str:
    user = await db.fetchrow(
        "UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id",
        hash_password(password), email
    )
    return str(user["id"]) if user else None


async def authenticate_user(db: Pool, email: str, password: str) -> Optional[dict]:
    user = await db.fetchrow("SELECT * FROM users WHERE email = $1", email)
    if not user or not user["password_hash"] or not verify_password(password, user["password_hash"]):
        return None
    return dict(user)

async def check_pending_account_request(db: Pool, user_id: str, req_type: str) -> bool:
    row = await db.fetchrow(
        "SELECT id FROM account_requests WHERE user_id = $1 AND type = $2 AND status = 'pending'",
        user_id, req_type,
    )
    return bool(row)

async def create_account_request(db: Pool, user: dict, req_type: str) -> None:
    await db.execute(
        "INSERT INTO account_requests (user_id, type) VALUES ($1, $2)",
        user["id"], req_type,
    )

    admins = await db.fetch("SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE")
    for admin in admins:
        req_label = req_type.replace("_", " ").title()
        await db.execute(
            """
            INSERT INTO notifications (user_id, title, message, type)
            VALUES ($1, $2, $3, 'admin')
            """,
            admin["id"], f"New {req_label} Request",
            f"{user['first_name']} {user['last_name']} ({user['email']}) has requested a {req_label.lower()}.",
        )
