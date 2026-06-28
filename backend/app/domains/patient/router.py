import json
from fastapi import APIRouter, Depends, HTTPException
from app.core.security import require_patient, get_current_user
from app.core.database import get_db
from .schemas import (
    BookAppointmentRequest, AppointmentResponse, TimeSlotsResponse,
    DoctorListResponse, MedicalRecordResponse, PrescriptionResponse,
    PaymentResponse, PatientProfileResponse, PatientProfileUpdateRequest,
    SharePrescriptionResponse, HospitalPrivacyResponse, UpdateHospitalPrivacyRequest,
    ShareAppointmentRequest
)
from . import service

router = APIRouter(prefix="/api/patient", tags=["patient"])

@router.get("/doctors", response_model=list[DoctorListResponse])
async def list_doctors(user=Depends(get_current_user), db=Depends(get_db)):
    patient_id = str(user["id"]) if user["role"] == "patient" else None
    rows = await service.list_doctors(db, patient_id)
    return [DoctorListResponse(
        id=str(r["id"]), user_id=str(r["user_id"]), first_name=r["first_name"],
        last_name=r["last_name"], specialization=r["specialization"],
        qualification=r["qualification"], experience_years=r["experience_years"],
        consultation_fee=float(r["consultation_fee"]), available_days=r["available_days"] or []
    ) for r in rows]

@router.get("/time-slots", response_model=TimeSlotsResponse)
async def get_time_slots(doctor_id: str, date: str, user=Depends(get_current_user), db=Depends(get_db)):
    res = await service.get_time_slots(db, doctor_id, date)
    if "error" in res:
        status = 404 if res["error"] == "not_found" else 400
        raise HTTPException(status_code=status, detail=res["msg"])
    return TimeSlotsResponse(time_slots=res["slots"])

@router.get("/appointments", response_model=list[AppointmentResponse])
async def get_appointments(user=Depends(require_patient), db=Depends(get_db)):
    rows = await service.get_appointments(db, user["id"])
    return [AppointmentResponse(
        id=str(r["id"]), patient_id=str(r["patient_id"]), doctor_id=str(r["doctor_id"]),
        doctor_name=r["doctor_name"], specialization=r["specialization"],
        date=str(r["date"]), time_slot=r["time_slot"].strftime("%H:%M"),
        duration_min=r["duration_min"], status=r["status"], reason=r["reason"],
        share_medical_summary=r["share_medical_summary"], notes=r["notes"], created_at=str(r["created_at"]) if r["created_at"] else None
    ) for r in rows]

@router.post("/appointments", response_model=AppointmentResponse)
async def book_appointment(req: BookAppointmentRequest, user=Depends(require_patient), db=Depends(get_db)):
    res = await service.book_appointment(db, user, req.model_dump())
    if "error" in res:
        status_code = 409 if res["error"] == "conflict" else (404 if res["error"] == "not_found" else 400)
        raise HTTPException(status_code=status_code, detail=res["msg"])
    return AppointmentResponse(**res)

@router.delete("/appointments/{appointment_id}")
async def cancel_appointment(appointment_id: str, user=Depends(require_patient), db=Depends(get_db)):
    if not await service.cancel_appointment(db, appointment_id, user):
        raise HTTPException(status_code=404, detail="Appointment not found or already cancelled")
    return {"message": "Appointment cancelled"}

@router.patch("/appointments/{appointment_id}/share")
async def toggle_appointment_sharing(appointment_id: str, req: ShareAppointmentRequest, user=Depends(require_patient), db=Depends(get_db)):
    if not await service.toggle_appointment_sharing(db, appointment_id, user["id"], req.share_medical_summary):
        raise HTTPException(status_code=404, detail="Appointment not found")
    status_str = "enabled" if req.share_medical_summary else "disabled"
    return {"message": f"Summary sharing {status_str}"}

@router.get("/medical-records", response_model=list[MedicalRecordResponse])
async def get_medical_records(user=Depends(require_patient), db=Depends(get_db)):
    rows = await service.get_medical_records(db, user["id"])
    return [MedicalRecordResponse(
        id=str(r["id"]), patient_id=str(r["patient_id"]), doctor_id=str(r["doctor_id"]) if r["doctor_id"] else None,
        doctor_name=r["doctor_name"], appointment_id=str(r["appointment_id"]) if r["appointment_id"] else None,
        diagnosis=r["diagnosis"], symptoms=r["symptoms"], notes=r["notes"], ai_summary=r["ai_summary"],
        created_at=str(r["created_at"]) if r["created_at"] else None
    ) for r in rows]

@router.get("/medical-records/ai-summary")
async def get_medical_records_summary(user=Depends(require_patient), db=Depends(get_db)):
    summary = await service.get_medical_records_summary(db, user["id"])
    return {"summary": summary}

@router.get("/prescriptions", response_model=list[PrescriptionResponse])
async def get_prescriptions(user=Depends(require_patient), db=Depends(get_db)):
    rows = await service.get_prescriptions(db, user["id"])
    return [PrescriptionResponse(
        id=str(r["id"]), medical_record_id=str(r["medical_record_id"]) if r["medical_record_id"] else None,
        patient_id=str(r["patient_id"]), doctor_id=str(r["doctor_id"]) if r["doctor_id"] else None,
        doctor_name=r["doctor_name"], medications=json.loads(r["medications"]) if isinstance(r["medications"], str) else r["medications"],
        instructions=r["instructions"], is_ai_generated=r["is_ai_generated"],
        created_at=str(r["created_at"]) if r["created_at"] else None
    ) for r in rows]

@router.post("/prescriptions/{prescription_id}/share", response_model=SharePrescriptionResponse)
async def share_prescription_with_pharmacy(prescription_id: str, user=Depends(require_patient), db=Depends(get_db)):
    res = await service.share_prescription(db, prescription_id, user["id"])
    if not res:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return SharePrescriptionResponse(**res)

@router.get("/payments", response_model=list[PaymentResponse])
async def get_payments(user=Depends(require_patient), db=Depends(get_db)):
    rows = await service.get_payments(db, user["id"])
    return [PaymentResponse(
        id=str(r["id"]), patient_id=str(r["patient_id"]), appointment_id=str(r["appointment_id"]) if r["appointment_id"] else None,
        amount=float(r["amount"]), status=r["status"], method=r["method"], description=r["description"],
        created_at=str(r["created_at"]) if r["created_at"] else None
    ) for r in rows]

@router.get("/profile", response_model=PatientProfileResponse)
async def get_profile(user=Depends(require_patient), db=Depends(get_db)):
    profile = await service.get_profile(db, user["id"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return PatientProfileResponse(
        id=str(profile["id"]), user_id=str(profile["user_id"]),
        date_of_birth=str(profile["date_of_birth"]) if profile["date_of_birth"] else None,
        gender=profile["gender"], blood_group=profile["blood_group"],
        address=profile["address"], emergency_contact=profile["emergency_contact"],
        insurance_id=profile["insurance_id"]
    )

@router.patch("/profile")
async def update_profile(req: PatientProfileUpdateRequest, user=Depends(require_patient), db=Depends(get_db)):
    await service.update_profile(db, user["id"], req.model_dump(exclude_unset=True))
    return {"message": "Profile updated"}


@router.get("/hospitals/privacy", response_model=list[HospitalPrivacyResponse])
async def list_patient_hospitals_privacy(user=Depends(require_patient), db=Depends(get_db)):
    rows = await service.list_patient_hospitals(db, user["id"])
    return [HospitalPrivacyResponse(
        id=str(r["id"]),
        name=r["name"],
        is_hidden=r["is_hidden"]
    ) for r in rows]


@router.patch("/hospitals/privacy")
async def update_patient_hospital_privacy(req: UpdateHospitalPrivacyRequest, user=Depends(require_patient), db=Depends(get_db)):
    await service.update_patient_hospital_privacy(db, user["id"], req.hospital_id, req.is_hidden)
    status_str = "hidden from" if req.is_hidden else "revealed to"
    return {"message": f"Details successfully {status_str} hospital"}
