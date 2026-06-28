from fastapi import APIRouter, Depends, HTTPException, Response
from app.core.security import (
    create_access_token, set_auth_cookie, clear_auth_cookie, get_current_user
)
from app.core.database import get_db
from .schemas import (
    RegisterPatientRequest, LoginRequest, AuthSuccessResponse, UserMeResponse, 
    AccountRequestCreate, CheckEmailRequest, CheckEmailResponse, SetPasswordRequest
)
from . import service

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=AuthSuccessResponse)
async def register_patient(req: RegisterPatientRequest, response: Response, db=Depends(get_db)):
    if await service.check_email_exists(db, req.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = await service.register_patient(db, req.model_dump())
    
    token = create_access_token(user_id, "patient")
    set_auth_cookie(response, token)
    return AuthSuccessResponse()

@router.post("/check-email", response_model=CheckEmailResponse)
async def check_email(req: CheckEmailRequest, db=Depends(get_db)):
    exists, is_new_user = await service.check_email_status(db, req.email)
    return CheckEmailResponse(exists=exists, is_new_user=is_new_user)

@router.post("/set-password", response_model=AuthSuccessResponse)
async def set_password(req: SetPasswordRequest, response: Response, db=Depends(get_db)):
    exists, is_new_user = await service.check_email_status(db, req.email)
    if not exists:
        raise HTTPException(status_code=404, detail="Email not found")
    if not is_new_user:
        raise HTTPException(status_code=400, detail="Password is already set. Please login.")

    user_id = await service.set_user_password(db, req.email, req.password)
    if not user_id:
        raise HTTPException(status_code=500, detail="Failed to set password")

    # After setting password, get the user to issue correct role token
    user = await service.authenticate_user(db, req.email, req.password)
    token = create_access_token(user_id, user["role"])
    set_auth_cookie(response, token)
    return AuthSuccessResponse()

@router.post("/login", response_model=AuthSuccessResponse)
async def login(req: LoginRequest, response: Response, db=Depends(get_db)):
    user = await service.authenticate_user(db, req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="Account deactivated")

    token = create_access_token(str(user["id"]), user["role"])
    set_auth_cookie(response, token)
    return AuthSuccessResponse()

@router.post("/logout", response_model=AuthSuccessResponse)
async def logout(response: Response):
    clear_auth_cookie(response)
    return AuthSuccessResponse()

@router.get("/me", response_model=UserMeResponse)
async def get_me(user=Depends(get_current_user), db=Depends(get_db)):
    hospital_name = None
    if user["role"] not in ["admin", "patient"]:
        h = await db.fetchrow(
            """
            SELECT h.name FROM hospitals h
            JOIN user_hospitals uh ON h.id = uh.hospital_id
            WHERE uh.user_id = $1
            """,
            user["id"]
        )
        if h:
            hospital_name = h["name"]

    return UserMeResponse(
        id=str(user["id"]), email=user["email"], first_name=user["first_name"],
        last_name=user["last_name"], phone=user.get("phone"), role=user["role"],
        is_active=user["is_active"], hospital_name=hospital_name
    )

@router.post("/account-request")
async def create_account_request(req: AccountRequestCreate, user=Depends(get_current_user), db=Depends(get_db)):
    if req.type not in ("password_reset", "account_deletion"):
        raise HTTPException(status_code=400, detail="Invalid request type")

    if await service.check_pending_account_request(db, str(user["id"]), req.type):
        raise HTTPException(status_code=409, detail=f"You already have a pending {req.type.replace('_', ' ')} request")

    await service.create_account_request(db, user, req.type)
    return {"message": f"{req.type.replace('_', ' ').title()} request submitted to admin"}
