from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import crud
from schemas import ComplaintCreate, ComplaintUpdate, ComplaintResponse, HistoryResponse

router = APIRouter()


@router.get("/complaints", response_model=List[ComplaintResponse])
def list_complaints(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    complaints = crud.get_complaints(db, skip=skip, limit=limit, status=status, category=category, priority=priority)
    return complaints


@router.get("/complaints/search", response_model=List[ComplaintResponse])
def search_complaints(
    keyword: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return crud.search_complaints(db, keyword=keyword, status=status, category=category, priority=priority)


@router.get("/complaints/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = crud.get_complaint(db, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@router.post("/complaints", response_model=ComplaintResponse, status_code=201)
def create_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db)):
    return crud.create_complaint(db, complaint)


@router.put("/complaints/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(complaint_id: int, update: ComplaintUpdate, db: Session = Depends(get_db)):
    complaint = crud.update_complaint(db, complaint_id, update)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@router.delete("/complaints/{complaint_id}")
def delete_complaint(complaint_id: int, db: Session = Depends(get_db)):
    success = crud.delete_complaint(db, complaint_id)
    if not success:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return {"message": "Complaint deleted successfully"}


@router.get("/complaints/{complaint_id}/history", response_model=List[HistoryResponse])
def get_complaint_history(complaint_id: int, db: Session = Depends(get_db)):
    complaint = crud.get_complaint(db, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return crud.get_complaint_history(db, complaint_id)


@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)
