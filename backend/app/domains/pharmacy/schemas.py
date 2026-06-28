from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from app.common.schemas import PrescriptionResponse

class PharmacyAccessRequest(BaseModel):
    access_token: str

class InventoryItemResponse(BaseModel):
    id: str
    medicine_name: str
    generic_name: Optional[str] = None
    category: Optional[str] = None
    quantity: int = 0
    unit_price: Optional[float] = None
    reorder_level: int = 10
    expiry_date: Optional[str] = None
    updated_at: Optional[str] = None

class InventoryItemCreateRequest(BaseModel):
    medicine_name: str = Field(..., min_length=1, max_length=255)
    generic_name: Optional[str] = None
    category: Optional[str] = None
    quantity: int = 0
    unit_price: Optional[float] = None
    reorder_level: int = 10
    expiry_date: Optional[date] = None

class InventoryItemUpdateRequest(BaseModel):
    medicine_name: Optional[str] = None
    generic_name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    reorder_level: Optional[int] = None
    expiry_date: Optional[date] = None
