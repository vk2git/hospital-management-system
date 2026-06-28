from asyncpg import Pool
from typing import Optional
from datetime import datetime, timezone

async def verify_prescription_token(db: Pool, access_token: str) -> Optional[dict]:
    presc = await db.fetchrow(
        """
        SELECT p.id, p.medical_record_id, p.patient_id,
               pu.first_name || ' ' || pu.last_name AS patient_name,
               p.doctor_id,
               du.first_name || ' ' || du.last_name AS doctor_name,
               p.medications, p.instructions, p.is_ai_generated,
               p.pharmacy_access_token, p.pharmacy_access_expires,
               p.created_at
        FROM prescriptions p
        JOIN users pu ON p.patient_id = pu.id
        LEFT JOIN users du ON p.doctor_id = du.id
        WHERE p.pharmacy_access_token = $1
        """,
        access_token,
    )
    return dict(presc) if presc else None

def check_token_expiry(expires: datetime) -> bool:
    if expires:
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires:
            return True
    return False

async def list_inventory(db: Pool) -> list[dict]:
    rows = await db.fetch(
        """
        SELECT id, medicine_name, generic_name, category,
               quantity, unit_price, reorder_level, expiry_date, updated_at
        FROM pharmacy_inventory
        ORDER BY medicine_name
        """
    )
    return [dict(r) for r in rows]

async def add_inventory_item(db: Pool, req: dict) -> dict:
    row = await db.fetchrow(
        """
        INSERT INTO pharmacy_inventory (medicine_name, generic_name, category, quantity, unit_price, reorder_level, expiry_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, updated_at
        """,
        req["medicine_name"], req["generic_name"], req["category"],
        req["quantity"], req["unit_price"], req["reorder_level"], req["expiry_date"],
    )
    return dict(row)

async def get_inventory_item(db: Pool, item_id: str) -> Optional[dict]:
    existing = await db.fetchrow("SELECT * FROM pharmacy_inventory WHERE id = $1", item_id)
    return dict(existing) if existing else None

async def update_inventory_item(db: Pool, item_id: str, updates: list, params: list) -> dict:
    await db.execute(
        f"UPDATE pharmacy_inventory SET {', '.join(updates)} WHERE id = ${len(params)}",
        *params,
    )
    return await get_inventory_item(db, item_id)

async def delete_inventory_item(db: Pool, item_id: str) -> bool:
    result = await db.execute("DELETE FROM pharmacy_inventory WHERE id = $1", item_id)
    return result != "DELETE 0"

async def get_inventory_analytics(db: Pool) -> dict:
    try:
        from app.ai.ollama_client import pharmacy_inventory_forecast
        inventory = await db.fetch("SELECT * FROM pharmacy_inventory ORDER BY medicine_name")
        prescriptions = await db.fetch(
            "SELECT medications, created_at FROM prescriptions ORDER BY created_at DESC LIMIT 100"
        )
        return await pharmacy_inventory_forecast(
            [dict(r) for r in inventory],
            [dict(r) for r in prescriptions],
        )
    except Exception as e:
        low_stock = await db.fetch(
            "SELECT medicine_name, quantity, reorder_level FROM pharmacy_inventory WHERE quantity <= reorder_level"
        )
        expiring = await db.fetch(
            "SELECT medicine_name, expiry_date FROM pharmacy_inventory WHERE expiry_date <= CURRENT_DATE + INTERVAL '30 days' AND expiry_date IS NOT NULL"
        )
        return {
            "low_stock_items": [dict(r) for r in low_stock],
            "expiring_soon": [{"medicine_name": r["medicine_name"], "expiry_date": str(r["expiry_date"])} for r in expiring],
            "ai_available": False,
            "message": "AI analytics unavailable, showing basic stats",
        }
