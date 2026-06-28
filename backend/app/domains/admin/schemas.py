from pydantic import BaseModel, Field
from typing import Optional
from app.common.schemas import DoctorListResponse

class AccountRequestResponse(BaseModel):
    id: str
    user_id: str
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    type: str
    status: str
    admin_notes: Optional[str] = None
    created_at: Optional[str] = None
    resolved_at: Optional[str] = None

class AccountRequestResolve(BaseModel):
    admin_notes: Optional[str] = None
    new_password: Optional[str] = None

class AdminUserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    created_at: Optional[str] = None
    hospital_name: Optional[str] = None


class CreateDoctorRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    first_name: str = Field(..., min_length=1, max_length=150)
    last_name: str = Field("", max_length=150)
    specialization: str = Field("General", max_length=100)
    qualification: Optional[str] = None
    experience_years: int = 0
    consultation_fee: float = 0
    available_days: list[str] = ["MON", "TUE", "WED", "THU", "FRI"]

class CreateHospitalRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

class HospitalResponse(BaseModel):
    id: str
    name: str
    address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

class CreateHospitalRoleRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    first_name: str = Field(..., min_length=1, max_length=150)
    last_name: str = Field("", max_length=150)
    phone: Optional[str] = None
    role: str = Field(..., description="E.g., hospital_admin, head_of_staff, head_of_doctor, staff, doctor")
    hospital_id: str
