from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from app.common.schemas import (
    AppointmentResponse, MedicalRecordResponse, PrescriptionResponse, DoctorListResponse
)

class ReassignAppointmentRequest(BaseModel):
    new_doctor_id: str

class CreateMedicalRecordRequest(BaseModel):
    patient_id: str
    appointment_id: Optional[str] = None
    diagnosis: Optional[str] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None

class MedicationItem(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str

class CreatePrescriptionRequest(BaseModel):
    patient_id: str
    medical_record_id: Optional[str] = None
    medications: list[MedicationItem]
    instructions: Optional[str] = None

class AIGeneratePrescriptionRequest(BaseModel):
    patient_id: str
    medical_record_id: Optional[str] = None
    diagnosis: str
    symptoms: str
    patient_info: Optional[str] = None

class SmartSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)

class SmartSearchResponse(BaseModel):
    results: list[dict]
    interpreted_query: Optional[str] = None
