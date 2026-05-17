from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


VALID_CATEGORIES = [
    "VPN Issue",
    "Password Reset",
    "Software Installation",
    "Laptop Issue",
    "Email Access",
    "Network Connectivity",
    "Hardware Request",
]

VALID_PRIORITIES = ["Low", "Medium", "High", "Critical"]
VALID_STATUSES = ["Open", "In Progress", "Resolved", "Closed"]


class TicketCreate(BaseModel):
    employee_name: str = Field(..., min_length=1, description="Employee full name")
    department: str = Field(..., min_length=1, description="Department name")
    issue_category: str = Field(..., description="Category of the issue")
    description: str = Field(..., min_length=10, description="Detailed description of the issue")
    priority: str = Field(..., description="Ticket priority level")

    class Config:
        json_schema_extra = {
            "example": {
                "employee_name": "John Doe",
                "department": "IT",
                "issue_category": "VPN Issue",
                "description": "Cannot connect to VPN from home office.",
                "priority": "High",
            }
        }


class TicketUpdate(BaseModel):
    employee_name: Optional[str] = None
    department: Optional[str] = None
    issue_category: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    resolution_notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "status": "Resolved",
                "resolution_notes": "VPN credentials were reset and user can now connect.",
            }
        }


class TicketResponse(BaseModel):
    ticket_id: int
    employee_name: str
    department: str
    issue_category: str
    description: str
    priority: str
    status: str
    resolution_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
