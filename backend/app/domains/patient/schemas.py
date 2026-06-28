from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.common.schemas import (
    AppointmentResponse, TimeSlotsResponse, DoctorListResponse,
    MedicalRecordResponse, PrescriptionResponse, PaymentResponse
)

class BookAppointmentRequest(BaseModel):
    doctor_id: str
    date: date
    time_slot: str
    reason: Optional[str] = None
    share_medical_summary: bool = False

class ShareAppointmentRequest(BaseModel):
    share_medical_summary: bool

class PatientProfileResponse(BaseModel):
    id: str
    user_id: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    insurance_id: Optional[str] = None

class PatientProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    insurance_id: Optional[str] = None

class SharePrescriptionResponse(BaseModel):
    access_token: str
    expires_at: str


class HospitalPrivacyResponse(BaseModel):
    id: str
    name: str
    is_hidden: bool


class UpdateHospitalPrivacyRequest(BaseModel):
    hospital_id: str
    is_hidden: bool
