import json
from fastapi import APIRouter, Depends, HTTPException
from app.core.security import require_pharmacy
from app.core.database import get_db
from .schemas import (
    PharmacyAccessRequest, PrescriptionResponse, InventoryItemResponse,
    InventoryItemCreateRequest, InventoryItemUpdateRequest
)
from . import service

router = APIRouter(prefix="/api/pharmacy", tags=["pharmacy"])

@router.post("/prescriptions/verify", response_model=PrescriptionResponse)
async def verify_prescription_access(req: PharmacyAccessRequest, user=Depends(require_pharmacy), db=Depends(get_db)):
    presc = await service.verify_prescription_token(db, req.access_token)
    if not presc:
        raise HTTPException(status_code=404, detail="Invalid access token")

    if service.check_token_expiry(presc["pharmacy_access_expires"]):
        raise HTTPException(status_code=403, detail="Access token has expired (10-minute window)")

    return PrescriptionResponse(
        id=str(presc["id"]),
        medical_record_id=str(presc["medical_record_id"]) if presc["medical_record_id"] else None,
        patient_id=str(presc["patient_id"]), patient_name=presc["patient_name"],
        doctor_id=str(presc["doctor_id"]) if presc["doctor_id"] else None,
        doctor_name=presc["doctor_name"],
        medications=json.loads(presc["medications"]) if isinstance(presc["medications"], str) else presc["medications"],
        instructions=presc["instructions"], is_ai_generated=presc["is_ai_generated"],
        created_at=str(presc["created_at"]) if presc["created_at"] else None,
    )

@router.get("/inventory", response_model=list[InventoryItemResponse])
async def list_inventory(user=Depends(require_pharmacy), db=Depends(get_db)):
    rows = await service.list_inventory(db)
    return [InventoryItemResponse(
        id=str(r["id"]), medicine_name=r["medicine_name"], generic_name=r["generic_name"],
        category=r["category"], quantity=r["quantity"],
        unit_price=float(r["unit_price"]) if r["unit_price"] else None,
        reorder_level=r["reorder_level"], expiry_date=str(r["expiry_date"]) if r["expiry_date"] else None,
        updated_at=str(r["updated_at"]) if r["updated_at"] else None
    ) for r in rows]

@router.post("/inventory", response_model=InventoryItemResponse)
async def add_inventory_item(req: InventoryItemCreateRequest, user=Depends(require_pharmacy), db=Depends(get_db)):
    row = await service.add_inventory_item(db, req.model_dump())
    return InventoryItemResponse(
        id=str(row["id"]), medicine_name=req.medicine_name, generic_name=req.generic_name,
        category=req.category, quantity=req.quantity, unit_price=req.unit_price,
        reorder_level=req.reorder_level, expiry_date=str(req.expiry_date) if req.expiry_date else None,
        updated_at=str(row["updated_at"]) if row["updated_at"] else None,
    )

@router.patch("/inventory/{item_id}", response_model=InventoryItemResponse)
async def update_inventory_item(item_id: str, req: InventoryItemUpdateRequest, user=Depends(require_pharmacy), db=Depends(get_db)):
    if not await service.get_inventory_item(db, item_id):
        raise HTTPException(status_code=404, detail="Item not found")

    updates, params = [], []
    idx = 1
    for field in ["medicine_name", "generic_name", "category", "quantity", "unit_price", "reorder_level", "expiry_date"]:
        val = getattr(req, field, None)
        if val is not None:
            updates.append(f"{field} = ${idx}")
            params.append(val)
            idx += 1

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    updates.append(f"updated_at = NOW()")
    params.append(item_id)
    
    updated = await service.update_inventory_item(db, item_id, updates, params)

    return InventoryItemResponse(
        id=str(updated["id"]), medicine_name=updated["medicine_name"],
        generic_name=updated["generic_name"], category=updated["category"],
        quantity=updated["quantity"], unit_price=float(updated["unit_price"]) if updated["unit_price"] else None,
        reorder_level=updated["reorder_level"], expiry_date=str(updated["expiry_date"]) if updated["expiry_date"] else None,
        updated_at=str(updated["updated_at"]) if updated["updated_at"] else None,
    )

@router.delete("/inventory/{item_id}")
async def delete_inventory_item(item_id: str, user=Depends(require_pharmacy), db=Depends(get_db)):
    if not await service.delete_inventory_item(db, item_id):
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}

@router.get("/analytics")
async def get_inventory_analytics(user=Depends(require_pharmacy), db=Depends(get_db)):
    return await service.get_inventory_analytics(db)
