from pydantic import BaseModel, Field
from typing import Optional

class StaffProfileResponse(BaseModel):
    id: str
    user_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    role_title: str
    department: Optional[str] = None
    shift: Optional[str] = None
    is_head: bool = False

class StaffInvitationRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    role_title: str = Field(..., min_length=1, max_length=100)
    department: Optional[str] = None

class StaffInvitationResponse(BaseModel):
    id: str
    email: str
    role_title: str
    department: Optional[str] = None
    is_used: bool = False
    created_at: Optional[str] = None
