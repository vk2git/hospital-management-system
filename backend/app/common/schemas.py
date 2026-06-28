from pydantic import BaseModel
from typing import Optional

class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: Optional[str] = None
    doctor_id: str
    doctor_name: Optional[str] = None
    specialization: Optional[str] = None
    date: str
    time_slot: str
    duration_min: int = 30
    status: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    share_medical_summary: bool = False
    created_at: Optional[str] = None

class MedicalRecordResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    appointment_id: Optional[str] = None
    diagnosis: Optional[str] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    ai_summary: Optional[str] = None
    created_at: Optional[str] = None

class PrescriptionResponse(BaseModel):
    id: str
    medical_record_id: Optional[str] = None
    patient_id: str
    patient_name: Optional[str] = None
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    medications: list[dict]
    instructions: Optional[str] = None
    is_ai_generated: bool = False
    created_at: Optional[str] = None

class DoctorListResponse(BaseModel):
    id: str
    user_id: str
    first_name: str
    last_name: str
    specialization: str
    qualification: Optional[str] = None
    experience_years: int = 0
    consultation_fee: float = 0
    available_days: list[str] = []

class PaymentResponse(BaseModel):
    id: str
    patient_id: str
    appointment_id: Optional[str] = None
    amount: float
    status: str
    method: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[str] = None

class TimeSlotsResponse(BaseModel):
    time_slots: list[str]
