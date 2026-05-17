from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import crud
import schemas
from database import get_db

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.get("", response_model=List[schemas.FeedbackResponse])
def get_all_feedback(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    search: Optional[str] = Query(default=None),
    rating: Optional[int] = Query(default=None, ge=1, le=5),
    program_name: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    return crud.get_all_feedback(db, skip=skip, limit=limit, search=search, rating=rating, program_name=program_name)


@router.get("/search", response_model=List[schemas.FeedbackResponse])
def search_feedback(
    query: Optional[str] = Query(default=None),
    rating: Optional[int] = Query(default=None, ge=1, le=5),
    program_name: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    return crud.get_all_feedback(db, search=query, rating=rating, program_name=program_name)


@router.get("/{feedback_id}", response_model=schemas.FeedbackResponse)
def get_feedback(feedback_id: int, db: Session = Depends(get_db)):
    feedback = crud.get_feedback_by_id(db, feedback_id)
    if feedback is None:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return feedback


@router.post("", response_model=schemas.FeedbackResponse, status_code=201)
def create_feedback(feedback: schemas.FeedbackCreate, db: Session = Depends(get_db)):
    return crud.create_feedback(db, feedback)


@router.put("/{feedback_id}", response_model=schemas.FeedbackResponse)
def update_feedback(
    feedback_id: int,
    feedback: schemas.FeedbackUpdate,
    db: Session = Depends(get_db),
):
    updated = crud.update_feedback(db, feedback_id, feedback)
    if updated is None:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return updated


@router.delete("/{feedback_id}")
def delete_feedback(feedback_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_feedback(db, feedback_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return {"message": "Feedback deleted successfully", "feedback_id": feedback_id}
