from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date

class RegisterPatientRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    first_name: str = Field(..., min_length=1, max_length=150)
    last_name: str = Field("", max_length=150)
    phone: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=20)
    blood_group: Optional[str] = Field(None, max_length=5)

class CheckEmailRequest(BaseModel):
    email: EmailStr

class CheckEmailResponse(BaseModel):
    exists: bool
    is_new_user: bool = False

class SetPasswordRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthSuccessResponse(BaseModel):
    success: bool = True

class UserMeResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    hospital_name: Optional[str] = None

class AccountRequestCreate(BaseModel):
    type: str = Field(..., description="'password_reset' or 'account_deletion'")
