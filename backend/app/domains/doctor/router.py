import json
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.security import require_doctor
from app.core.database import get_db
from .schemas import (
    AppointmentResponse, ReassignAppointmentRequest, MedicalRecordResponse,
    CreateMedicalRecordRequest, PrescriptionResponse, CreatePrescriptionRequest,
    AIGeneratePrescriptionRequest, DoctorListResponse, SmartSearchRequest, SmartSearchResponse
)
from . import service

router = APIRouter(prefix="/api/doctor", tags=["doctor"])

@router.get("/appointments", response_model=list[AppointmentResponse])
async def get_doctor_appointments(user=Depends(require_doctor), db=Depends(get_db)):
    rows = await service.get_doctor_appointments(db, user["id"])
    return [AppointmentResponse(
        id=str(r["id"]), patient_id=str(r["patient_id"]), patient_name=r["patient_name"],
        doctor_id=str(r["doctor_id"]), date=str(r["date"]), time_slot=r["time_slot"].strftime("%H:%M"),
        duration_min=r["duration_min"], status=r["status"], reason=r["reason"],
        share_medical_summary=r["share_medical_summary"], notes=r["notes"],
        created_at=str(r["created_at"]) if r["created_at"] else None
    ) for r in rows]

@router.patch("/appointments/{appointment_id}/complete")
async def complete_appointment(appointment_id: str, user=Depends(require_doctor), db=Depends(get_db)):
    if not await service.complete_appointment(db, appointment_id, user):
        raise HTTPException(status_code=404, detail="Appointment not found or not in scheduled state")
    return {"message": "Appointment marked as completed"}

@router.patch("/appointments/{appointment_id}/cancel")
async def cancel_appointment(appointment_id: str, user=Depends(require_doctor), db=Depends(get_db)):
    if not await service.cancel_appointment(db, appointment_id, user):
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment cancelled"}

@router.get("/appointments/{appointment_id}/shared-summary")
async def get_shared_patient_summary(appointment_id: str, user=Depends(require_doctor), db=Depends(get_db)):
    res = await service.get_shared_patient_summary(db, user["id"], appointment_id)
    if "error" in res:
        status_code = 403 if res["error"] == "forbidden" else 404
        raise HTTPException(status_code=status_code, detail=res["msg"])
    return {"summary": res["summary"]}

@router.patch("/appointments/{appointment_id}/reassign")
async def reassign_appointment(appointment_id: str, req: ReassignAppointmentRequest, user=Depends(require_doctor), db=Depends(get_db)):
    res = await service.reassign_appointment(db, appointment_id, req.new_doctor_id, user)
    if "error" in res:
        status_code = 409 if res["error"] == "conflict" else 404
        raise HTTPException(status_code=status_code, detail=res["msg"])
    return {"message": "Appointment reassigned"}

@router.get("/patients")
async def list_patients(search: str = Query(None), user=Depends(require_doctor), db=Depends(get_db)):
    return await service.list_patients(db, user["id"], search)

@router.get("/patients/{patient_id}/records", response_model=list[MedicalRecordResponse])
async def get_patient_records(patient_id: str, user=Depends(require_doctor), db=Depends(get_db)):
    records = await service.get_patient_records(db, user["id"], patient_id)
    if not records:
        raise HTTPException(status_code=403, detail="You have not treated this patient")
    return [MedicalRecordResponse(
        id=str(r["id"]), patient_id=str(r["patient_id"]), doctor_id=str(r["doctor_id"]) if r["doctor_id"] else None,
        doctor_name=r["doctor_name"], appointment_id=str(r["appointment_id"]) if r["appointment_id"] else None,
        diagnosis=r["diagnosis"], symptoms=r["symptoms"], notes=r["notes"], ai_summary=r["ai_summary"],
        created_at=str(r["created_at"]) if r["created_at"] else None
    ) for r in records]

@router.post("/medical-records", response_model=MedicalRecordResponse)
async def create_medical_record(req: CreateMedicalRecordRequest, user=Depends(require_doctor), db=Depends(get_db)):
    row = await service.create_medical_record(db, user, req.model_dump())
    return MedicalRecordResponse(
        id=str(row["id"]), patient_id=req.patient_id, doctor_id=str(user["id"]), doctor_name=f"{user['first_name']} {user['last_name']}",
        appointment_id=req.appointment_id, diagnosis=req.diagnosis, symptoms=req.symptoms, notes=req.notes,
        created_at=str(row["created_at"]) if row["created_at"] else None
    )

@router.get("/prescriptions", response_model=list[PrescriptionResponse])
async def get_doctor_prescriptions(user=Depends(require_doctor), db=Depends(get_db)):
    rows = await service.get_doctor_prescriptions(db, user["id"])
    return [PrescriptionResponse(
        id=str(r["id"]), medical_record_id=str(r["medical_record_id"]) if r["medical_record_id"] else None,
        patient_id=str(r["patient_id"]), patient_name=r["patient_name"], doctor_id=str(r["doctor_id"]),
        medications=json.loads(r["medications"]) if isinstance(r["medications"], str) else r["medications"],
        instructions=r["instructions"], is_ai_generated=r["is_ai_generated"],
        created_at=str(r["created_at"]) if r["created_at"] else None
    ) for r in rows]

@router.post("/prescriptions", response_model=PrescriptionResponse)
async def create_prescription(req: CreatePrescriptionRequest, user=Depends(require_doctor), db=Depends(get_db)):
    data = req.model_dump()
    row = await service.create_prescription(db, user, data)
    return PrescriptionResponse(
        id=str(row["id"]), medical_record_id=req.medical_record_id, patient_id=req.patient_id, doctor_id=str(user["id"]),
        medications=data["medications"], instructions=req.instructions, is_ai_generated=False,
        created_at=str(row["created_at"]) if row["created_at"] else None
    )

@router.post("/prescriptions/ai-generate", response_model=PrescriptionResponse)
async def ai_generate_prescription(req: AIGeneratePrescriptionRequest, user=Depends(require_doctor), db=Depends(get_db)):
    data = req.model_dump()
    row = await service.ai_generate_prescription(db, user, data)
    return PrescriptionResponse(
        id=str(row["id"]), medical_record_id=req.medical_record_id, patient_id=req.patient_id, doctor_id=str(user["id"]),
        medications=row["medications"], instructions=row["instructions"], is_ai_generated=True,
        created_at=str(row["created_at"]) if row["created_at"] else None
    )

@router.post("/smart-search", response_model=SmartSearchResponse)
async def smart_search(req: SmartSearchRequest, user=Depends(require_doctor), db=Depends(get_db)):
    res = await service.smart_search(db, str(user["id"]), req.query)
    return SmartSearchResponse(**res)

@router.get("/other-doctors", response_model=list[DoctorListResponse])
async def list_other_doctors(user=Depends(require_doctor), db=Depends(get_db)):
    rows = await service.list_other_doctors(db, user["id"])
    return [DoctorListResponse(
        id=str(r["id"]), user_id=str(r["user_id"]), first_name=r["first_name"], last_name=r["last_name"],
        specialization=r["specialization"], qualification=r["qualification"], experience_years=r["experience_years"],
        consultation_fee=float(r["consultation_fee"]), available_days=r["available_days"] or []
    ) for r in rows]
