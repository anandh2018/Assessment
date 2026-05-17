from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class FeedbackCreate(BaseModel):
    participant_name: str
    program_name: str
    rating: int
    comments: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_must_be_valid(cls, v):
        if v < 1 or v > 5:
            raise ValueError("Rating must be between 1 and 5")
        return v

    @field_validator("participant_name")
    @classmethod
    def participant_name_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Participant name cannot be empty")
        return v.strip()

    @field_validator("program_name")
    @classmethod
    def program_name_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Program name cannot be empty")
        return v.strip()


class FeedbackUpdate(BaseModel):
    participant_name: Optional[str] = None
    program_name: Optional[str] = None
    rating: Optional[int] = None
    comments: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_must_be_valid(cls, v):
        if v is not None and (v < 1 or v > 5):
            raise ValueError("Rating must be between 1 and 5")
        return v


class FeedbackResponse(BaseModel):
    feedback_id: int
    participant_name: str
    program_name: str
    rating: int
    comments: Optional[str] = None
    submitted_at: datetime

    model_config = {"from_attributes": True}
