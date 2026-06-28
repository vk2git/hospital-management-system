"""
Database initialisation — runs schema on startup and seeds admin.
"""

import asyncpg
from .database import get_pool
from .models import SCHEMA_SQL
from app.core.security import hash_password
from .config import ADMIN_EMAIL, ADMIN_PASSWORD


async def init_db():
    """Create all tables, types, and seed data."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(SCHEMA_SQL)
        print("✓ Database schema applied successfully")

        # Dynamic/Safe seeding of initial admin account
        admin_exists = await conn.fetchval("SELECT EXISTS(SELECT 1 FROM users WHERE role = 'admin')")
        if not admin_exists:
            hashed_pwd = hash_password(ADMIN_PASSWORD)
            await conn.execute(
                """
                INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
                VALUES ($1, $2, 'System', 'Admin', 'admin', TRUE)
                ON CONFLICT (email) DO NOTHING
                """,
                ADMIN_EMAIL,
                hashed_pwd,
            )
            print(f"✓ Initial admin account seeded with email: {ADMIN_EMAIL}")
