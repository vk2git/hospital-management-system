from fastapi import APIRouter, Depends, HTTPException
from app.core.security import require_admin, require_system_or_hospital_admin
from app.core.database import get_db
from .schemas import (
    AccountRequestResponse, AccountRequestResolve, AdminUserResponse,
    CreateDoctorRequest, DoctorListResponse, CreateHospitalRequest,
    HospitalResponse, CreateHospitalRoleRequest
)
from . import service

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/account-requests", response_model=list[AccountRequestResponse])
async def list_account_requests(status: str = None, user=Depends(require_admin), db=Depends(get_db)):
    rows = await service.list_account_requests(db, status)
    return [AccountRequestResponse(
        id=str(r["id"]), user_id=str(r["user_id"]), user_email=r["user_email"],
        user_name=r["user_name"], user_role=r["user_role"], type=r["type"],
        status=r["status"], admin_notes=r["admin_notes"],
        created_at=str(r["created_at"]) if r["created_at"] else None,
        resolved_at=str(r["resolved_at"]) if r["resolved_at"] else None
    ) for r in rows]

@router.patch("/account-requests/{request_id}/approve")
async def approve_request(request_id: str, body: AccountRequestResolve, user=Depends(require_admin), db=Depends(get_db)):
    req = await service.get_pending_request(db, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found or already resolved")

    if req["type"] == "password_reset":
        if not body.new_password:
            raise HTTPException(status_code=400, detail="New password is required for password reset approval")
        await service.approve_password_reset(db, request_id, req["user_id"], body.new_password, body.admin_notes)
    elif req["type"] == "account_deletion":
        await service.approve_account_deletion(db, request_id, req["user_id"], body.admin_notes)

    return {"message": f"Request approved ({req['type']})"}

@router.patch("/account-requests/{request_id}/reject")
async def reject_request(request_id: str, body: AccountRequestResolve, user=Depends(require_admin), db=Depends(get_db)):
    req = await service.get_pending_request(db, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found or already resolved")
    await service.reject_request(db, req, body.admin_notes)
    return {"message": "Request rejected"}

@router.get("/users", response_model=list[AdminUserResponse])
async def list_users(role: str = None, user=Depends(require_system_or_hospital_admin), db=Depends(get_db)):
    admin_hospital_id = None
    if user["role"] == "admin":
        if role != "hospital_admin":
            return [] # System admin shouldn't see hospital users directly
    
    if user["role"] == "hospital_admin":
        admin_h = await db.fetchrow("SELECT hospital_id FROM user_hospitals WHERE user_id = $1", user["id"])
        if admin_h:
            admin_hospital_id = str(admin_h["hospital_id"])
            
    rows = await service.list_users(db, role, admin_hospital_id)
    if user["role"] == "hospital_admin":
        rows = [r for r in rows if r["role"] != "admin"]
    
    return [AdminUserResponse(
        id=str(r["id"]), email=r["email"], first_name=r["first_name"],
        last_name=r["last_name"], role=r["role"], is_active=r["is_active"],
        created_at=str(r["created_at"]) if r["created_at"] else None,
        hospital_name=r.get("hospital_name")
    ) for r in rows]


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, user=Depends(require_system_or_hospital_admin), db=Depends(get_db)):
    if user["role"] == "admin":
        raise HTTPException(status_code=403, detail="System admin cannot delete users directly. Use hospital_admin.")
    
    if not await service.check_approved_deletion(db, user_id):
        raise HTTPException(status_code=403, detail="Cannot delete user without an approved account deletion request")
    
    role = await service.get_user_role(db, user_id)
    if not role:
        raise HTTPException(status_code=404, detail="User not found")
    if role == "admin":
        raise HTTPException(status_code=403, detail="Cannot delete admin accounts")

    await service.delete_user(db, user_id)
    return {"message": "User account permanently deleted"}

@router.get("/doctors", response_model=list[DoctorListResponse])
async def list_doctors(user=Depends(require_system_or_hospital_admin), db=Depends(get_db)):
    if user["role"] == "admin":
        return []
    
    rows = await service.list_doctors(db)
    return [DoctorListResponse(
        id=str(r["id"]), user_id=str(r["user_id"]), first_name=r["first_name"],
        last_name=r["last_name"], specialization=r["specialization"],
        qualification=r["qualification"], experience_years=r["experience_years"],
        consultation_fee=float(r["consultation_fee"]), available_days=r["available_days"] or []
    ) for r in rows]

@router.post("/doctors", response_model=DoctorListResponse)
async def create_doctor(req: CreateDoctorRequest, user=Depends(require_system_or_hospital_admin), db=Depends(get_db)):
    if user["role"] == "admin":
        raise HTTPException(status_code=403, detail="System admin cannot create doctors directly. Use hospital_admin.")
        
    if await service.check_email_exists(db, req.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    doc = await service.create_doctor(db, req.model_dump())
    
    return DoctorListResponse(
        id=doc["id"], user_id=doc["user_id"], first_name=doc["first_name"],
        last_name=doc["last_name"], specialization=req.specialization,
        qualification=req.qualification, experience_years=req.experience_years,
        consultation_fee=req.consultation_fee, available_days=req.available_days
    )

@router.get("/stats")
async def get_admin_stats(user=Depends(require_system_or_hospital_admin), db=Depends(get_db)):
    return await service.get_system_stats(db)

@router.get("/hospitals", response_model=list[HospitalResponse])
async def list_hospitals(user=Depends(require_system_or_hospital_admin), db=Depends(get_db)):
    hospitals = await service.list_hospitals(db)
    return [HospitalResponse(
        id=str(h["id"]),
        name=h["name"],
        address=h["address"],
        contact_email=h["contact_email"],
        contact_phone=h["contact_phone"]
    ) for h in hospitals]

@router.post("/hospitals", response_model=HospitalResponse)
async def create_hospital(req: CreateHospitalRequest, user=Depends(require_admin), db=Depends(get_db)):
    hospital = await service.create_hospital(db, req.model_dump())
    return HospitalResponse(
        id=str(hospital["id"]),
        name=hospital["name"],
        address=hospital["address"],
        contact_email=hospital["contact_email"],
        contact_phone=hospital["contact_phone"]
    )

@router.post("/roles")
async def create_hospital_role(req: CreateHospitalRoleRequest, user=Depends(require_system_or_hospital_admin), db=Depends(get_db)):
    # Check permissions
    if user["role"] == "admin" and req.role != "hospital_admin":
        raise HTTPException(status_code=403, detail="System admin can only create hospital_admin.")
        
    if req.role == "hospital_admin" and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can create hospital_admin")
    if req.role in ["head_of_staff", "head_of_doctor"] and user["role"] not in ["admin", "hospital_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to create this role")
    if req.role == "staff" and user["role"] not in ["admin", "hospital_admin", "head_of_staff"]:
        raise HTTPException(status_code=403, detail="Not authorized to create staff")
    if req.role == "doctor" and user["role"] not in ["admin", "hospital_admin", "head_of_doctor"]:
        raise HTTPException(status_code=403, detail="Not authorized to create doctor")

    # In a real app we'd verify the caller (if not admin) belongs to the target hospital_id.
    # We will assume that check is done or left for future scope.

    result = await service.create_hospital_role(db, req.model_dump())
    return {"message": f"Successfully created/assigned role {req.role}", **result}

