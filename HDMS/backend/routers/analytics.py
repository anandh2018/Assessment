from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from analytics_models import TicketAnalytics, CategoryAnalytics, DepartmentAnalytics, PriorityAnalytics
from etl import run_etl, get_etl_status

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.post("/etl/run")
def trigger_etl():
    try:
        return run_etl()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/etl/status")
def etl_status():
    return get_etl_status()

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    total = db.query(TicketAnalytics).count()
    resolved = db.query(TicketAnalytics).filter(TicketAnalytics.status.in_(["Resolved", "Closed"])).count()
    from sqlalchemy import func
    avg_hours = db.query(func.avg(TicketAnalytics.resolution_time_hours)).filter(TicketAnalytics.resolution_time_hours > 0).scalar() or 0
    return {"total_records": total, "resolved_count": resolved, "avg_resolution_hours": round(float(avg_hours), 2)}

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    rows = db.query(CategoryAnalytics).order_by(CategoryAnalytics.total_count.desc()).all()
    return [{"issue_category": r.issue_category, "total_count": r.total_count, "resolved_count": r.resolved_count, "avg_resolution_hours": r.avg_resolution_hours} for r in rows]

@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    rows = db.query(DepartmentAnalytics).order_by(DepartmentAnalytics.ticket_count.desc()).all()
    return [{"department": r.department, "ticket_count": r.ticket_count, "resolved_count": r.resolved_count, "avg_resolution_hours": r.avg_resolution_hours} for r in rows]

@router.get("/priorities")
def get_priorities(db: Session = Depends(get_db)):
    rows = db.query(PriorityAnalytics).all()
    return [{"priority": r.priority, "total_count": r.total_count, "resolved_count": r.resolved_count, "avg_resolution_hours": r.avg_resolution_hours} for r in rows]
