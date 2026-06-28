from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import json
from asyncpg import Pool

from app.core.security import get_current_user
from app.core.database import get_db

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: Optional[str] = None
    is_read: bool = False
    metadata: Optional[dict] = None
    created_at: Optional[str] = None

class UnreadCountResponse(BaseModel):
    count: int

async def get_user_notifications(db: Pool, user_id: str, limit: int = 50) -> list[dict]:
    rows = await db.fetch(
        """
        SELECT id, title, message, type, is_read, metadata, created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
        """,
        user_id,
        limit,
    )
    result = []
    for r in rows:
        result.append({
            "id": str(r["id"]),
            "title": r["title"],
            "message": r["message"],
            "type": r["type"],
            "is_read": r["is_read"],
            "metadata": json.loads(r["metadata"]) if isinstance(r["metadata"], str) else r["metadata"],
            "created_at": str(r["created_at"]) if r["created_at"] else None,
        })
    return result

async def get_unread_count(db: Pool, user_id: str) -> int:
    count = await db.fetchval(
        "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE",
        user_id,
    )
    return count

async def mark_notification_read(db: Pool, notification_id: str, user_id: str) -> bool:
    result = await db.execute(
        "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2",
        notification_id,
        user_id,
    )
    return result != "UPDATE 0"

async def mark_all_notifications_read(db: Pool, user_id: str) -> None:
    await db.execute(
        "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
        user_id,
    )

@router.get("/", response_model=list[NotificationResponse])
async def get_notifications(
    user=Depends(get_current_user),
    db=Depends(get_db),
    limit: int = 50,
):
    """Get user's notifications, most recent first."""
    notifications = await get_user_notifications(db, user["id"], limit)
    return notifications

@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count_route(user=Depends(get_current_user), db=Depends(get_db)):
    """Get count of unread notifications."""
    count = await get_unread_count(db, user["id"])
    return UnreadCountResponse(count=count)

@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Mark a notification as read."""
    success = await mark_notification_read(db, notification_id, user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Marked as read"}

@router.patch("/read-all")
async def mark_all_read_route(user=Depends(get_current_user), db=Depends(get_db)):
    """Mark all notifications as read."""
    await mark_all_notifications_read(db, user["id"])
    return {"message": "All notifications marked as read"}
