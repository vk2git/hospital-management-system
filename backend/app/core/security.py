"""
Authentication & Authorisation — httpOnly cookie JWT.

Security model:
- JWT is stored in a httpOnly, SameSite=Lax cookie.
- The token is NEVER exposed to JavaScript / response body.
- Frontend discovers role via GET /api/auth/me (cookie auto-sent).
- Backend enforces authorisation on every endpoint independently.
"""

import os
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, Request, Response, status
from jose import JWTError, jwt
import bcrypt

from .database import get_db

# ── Config ──────────────────────────────────────────────────────────────────

from .config import SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
COOKIE_NAME = "hms_session"

# ── Password Helpers ────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


# ── JWT Helpers ─────────────────────────────────────────────────────────────

def create_access_token(user_id: str, role: str) -> str:
    """Create JWT. user_id is UUID string, role is enum value."""
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": user_id, "role": role, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )


def set_auth_cookie(response: Response, token: str):
    """Set JWT in httpOnly cookie — never visible to JS."""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,          # Set True in production (HTTPS)
        max_age=ACCESS_TOKEN_EXPIRE_HOURS * 3600,
        path="/",
    )


def clear_auth_cookie(response: Response):
    """Remove the auth cookie on logout."""
    response.delete_cookie(key=COOKIE_NAME, path="/")


# ── Dependency: Current User ───────────────────────────────────────────────

async def get_current_user(request: Request, db=Depends(get_db)):
    """Extract and validate user from httpOnly cookie JWT."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    payload = decode_token(token)
    user_id = payload["sub"]

    user = await db.fetchrow("SELECT * FROM users WHERE id = $1", user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="Account deactivated")

    return dict(user)


# ── Role-based dependencies ───────────────────────────────────────────────

async def require_patient(user=Depends(get_current_user)):
    if user["role"] != "patient":
        raise HTTPException(status_code=403, detail="Patient access required")
    return user


async def require_doctor(user=Depends(get_current_user)):
    if user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access required")
    return user


async def require_admin(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def require_system_or_hospital_admin(user=Depends(get_current_user)):
    if user["role"] not in ["admin", "hospital_admin"]:
        raise HTTPException(status_code=403, detail="System or Hospital Admin access required")
    return user


async def require_staff(user=Depends(get_current_user)):
    if user["role"] != "staff":
        raise HTTPException(status_code=403, detail="Staff access required")
    return user


async def require_pharmacy(user=Depends(get_current_user)):
    if user["role"] != "pharmacy":
        raise HTTPException(status_code=403, detail="Pharmacy access required")
    return user


async def require_staff_head(user=Depends(require_staff), db=Depends(get_db)):
    """Must be staff AND head of staff."""
    profile = await db.fetchrow(
        "SELECT is_head FROM staff_profiles WHERE user_id = $1", user["id"]
    )
    if not profile or not profile["is_head"]:
        raise HTTPException(status_code=403, detail="Head of staff access required")
    return user
