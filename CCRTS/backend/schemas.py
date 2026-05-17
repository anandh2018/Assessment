from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class ComplaintCreate(BaseModel):
    customer_name: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    category: str
    priority: str
    description: str

    class Config:
        from_attributes = True


class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None
    comments: Optional[str] = None
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    history_id: int
    complaint_id: int
    old_status: Optional[str] = None
    new_status: str
    updated_by: Optional[str] = None
    comments: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ComplaintResponse(BaseModel):
    complaint_id: int
    complaint_number: str
    customer_name: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    category: str
    priority: str
    description: str
    status: str
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    history: Optional[List[HistoryResponse]] = []

    class Config:
        from_attributes = True
