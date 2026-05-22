from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from analytics_models import ComplaintAnalytics, CategorySummary, AgentPerformance, PrioritySummary
from etl import run_etl, get_etl_status

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.post("/etl/run")
def trigger_etl():
    try:
        result = run_etl()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/etl/status")
def etl_status():
    return get_etl_status()

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    total = db.query(ComplaintAnalytics).count()
    breached = db.query(ComplaintAnalytics).filter(ComplaintAnalytics.sla_breached == True).count()
    resolved = db.query(ComplaintAnalytics).filter(ComplaintAnalytics.status.in_(["Resolved", "Closed"])).count()
    return {
        "total_records": total,
        "sla_breached": breached,
        "resolved_count": resolved,
        "breach_rate": round(breached / total * 100, 2) if total > 0 else 0,
    }

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    rows = db.query(CategorySummary).all()
    return [{"category": r.category, "total_count": r.total_count, "resolved_count": r.resolved_count, "avg_resolution_hours": r.avg_resolution_hours, "sla_breach_count": r.sla_breach_count} for r in rows]

@router.get("/agents")
def get_agents(db: Session = Depends(get_db)):
    rows = db.query(AgentPerformance).all()
    return [{"agent_name": r.agent_name, "total_assigned": r.total_assigned, "resolved_count": r.resolved_count, "avg_resolution_hours": r.avg_resolution_hours, "sla_breach_count": r.sla_breach_count} for r in rows]

@router.get("/priorities")
def get_priorities(db: Session = Depends(get_db)):
    rows = db.query(PrioritySummary).all()
    return [{"priority": r.priority, "total_count": r.total_count, "resolved_count": r.resolved_count, "avg_resolution_hours": r.avg_resolution_hours, "breach_rate": r.breach_rate} for r in rows]

@router.get("/sla-breaches")
def get_sla_breaches(db: Session = Depends(get_db)):
    rows = db.query(ComplaintAnalytics).filter(ComplaintAnalytics.sla_breached == True).all()
    return [{"complaint_number": r.complaint_number, "category": r.category, "priority": r.priority, "assigned_to": r.assigned_to, "resolution_time_hours": r.resolution_time_hours, "sla_hours": r.sla_hours} for r in rows]
