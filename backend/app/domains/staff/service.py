from asyncpg import Pool
from typing import Optional

async def get_staff_profile(db: Pool, user_id: str) -> Optional[dict]:
    profile = await db.fetchrow(
        "SELECT * FROM staff_profiles WHERE user_id = $1", user_id
    )
    return dict(profile) if profile else None

async def list_staff_members(db: Pool) -> list[dict]:
    rows = await db.fetch(
        """
        SELECT sp.id, sp.user_id, u.first_name, u.last_name, u.email,
               sp.role_title, sp.department, sp.shift, sp.is_head
        FROM staff_profiles sp
        JOIN users u ON sp.user_id = u.id
        WHERE u.is_active = TRUE
        ORDER BY sp.is_head DESC, u.first_name
        """
    )
    return [dict(r) for r in rows]

async def check_email_registered(db: Pool, email: str) -> bool:
    row = await db.fetchrow("SELECT id FROM users WHERE email = $1", email)
    return bool(row)

async def check_unused_invitation_exists(db: Pool, email: str) -> bool:
    row = await db.fetchrow(
        "SELECT id FROM staff_invitations WHERE email = $1 AND is_used = FALSE",
        email,
    )
    return bool(row)

async def create_staff_invitation(db: Pool, email: str, role_title: str, department: Optional[str], invited_by: str) -> dict:
    row = await db.fetchrow(
        """
        INSERT INTO staff_invitations (email, role_title, department, invited_by)
        VALUES ($1, $2, $3, $4)
        RETURNING id, created_at
        """,
        email,
        role_title,
        department,
        invited_by,
    )
    return dict(row)

async def list_invitations(db: Pool, user_id: str) -> list[dict]:
    rows = await db.fetch(
        """
        SELECT id, email, role_title, department, is_used, created_at
        FROM staff_invitations
        WHERE invited_by = $1
        ORDER BY created_at DESC
        """,
        user_id,
    )
    return [dict(r) for r in rows]
