from fastapi import APIRouter, Depends, HTTPException
from app.core.security import require_staff, require_staff_head
from app.core.database import get_db
from .schemas import StaffProfileResponse, StaffInvitationRequest, StaffInvitationResponse
from . import service

router = APIRouter(prefix="/api/staff", tags=["staff"])

@router.get("/profile", response_model=StaffProfileResponse)
async def get_staff_profile(user=Depends(require_staff), db=Depends(get_db)):
    """Get current staff member's profile."""
    profile = await service.get_staff_profile(db, user["id"])
    if not profile:
        raise HTTPException(status_code=404, detail="Staff profile not found")

    return StaffProfileResponse(
        id=str(profile["id"]),
        user_id=str(profile["user_id"]),
        first_name=user["first_name"],
        last_name=user["last_name"],
        email=user["email"],
        role_title=profile["role_title"],
        department=profile["department"],
        shift=profile["shift"],
        is_head=profile["is_head"],
    )

@router.get("/members", response_model=list[StaffProfileResponse])
async def list_staff_members(user=Depends(require_staff), db=Depends(get_db)):
    """List all staff members."""
    rows = await service.list_staff_members(db)
    return [
        StaffProfileResponse(
            id=str(r["id"]),
            user_id=str(r["user_id"]),
            first_name=r["first_name"],
            last_name=r["last_name"],
            email=r["email"],
            role_title=r["role_title"],
            department=r["department"],
            shift=r["shift"],
            is_head=r["is_head"],
        )
        for r in rows
    ]

@router.post("/invitations", response_model=StaffInvitationResponse)
async def invite_staff(
    req: StaffInvitationRequest,
    user=Depends(require_staff_head),
    db=Depends(get_db),
):
    """Head of staff invites a new staff member by email."""
    if await service.check_email_registered(db, req.email):
        raise HTTPException(status_code=400, detail="This email is already registered")

    if await service.check_unused_invitation_exists(db, req.email):
        raise HTTPException(status_code=409, detail="An invitation for this email already exists")

    row = await service.create_staff_invitation(db, req.email, req.role_title, req.department, user["id"])

    return StaffInvitationResponse(
        id=str(row["id"]),
        email=req.email,
        role_title=req.role_title,
        department=req.department,
        created_at=str(row["created_at"]) if row["created_at"] else None,
    )

@router.get("/invitations", response_model=list[StaffInvitationResponse])
async def list_invitations(user=Depends(require_staff_head), db=Depends(get_db)):
    """List all staff invitations (head of staff only)."""
    rows = await service.list_invitations(db, user["id"])
    return [
        StaffInvitationResponse(
            id=str(r["id"]),
            email=r["email"],
            role_title=r["role_title"],
            department=r["department"],
            is_used=r["is_used"],
            created_at=str(r["created_at"]) if r["created_at"] else None,
        )
        for r in rows
    ]
