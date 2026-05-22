from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from analytics_models import FeedbackAnalytics, ProgramSummary, RatingDistribution
from etl import run_etl, get_etl_status
import io
import csv

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
    total = db.query(FeedbackAnalytics).count()
    if total == 0:
        return {"total_records": 0, "avg_rating": 0, "positive_count": 0, "negative_count": 0}
    from sqlalchemy import func
    avg = db.query(func.avg(FeedbackAnalytics.rating)).scalar() or 0
    positive = db.query(FeedbackAnalytics).filter(FeedbackAnalytics.rating >= 4).count()
    negative = db.query(FeedbackAnalytics).filter(FeedbackAnalytics.rating <= 2).count()
    return {"total_records": total, "avg_rating": round(float(avg), 2), "positive_count": positive, "negative_count": negative}

@router.get("/programs")
def get_programs(db: Session = Depends(get_db)):
    rows = db.query(ProgramSummary).order_by(ProgramSummary.avg_rating.desc()).all()
    return [{"program_name": r.program_name, "total_count": r.total_count, "avg_rating": r.avg_rating, "positive_count": r.positive_count, "negative_count": r.negative_count} for r in rows]

@router.get("/ratings")
def get_ratings(db: Session = Depends(get_db)):
    rows = db.query(RatingDistribution).order_by(RatingDistribution.rating).all()
    return [{"rating": r.rating, "count": r.count, "percentage": r.percentage} for r in rows]

@router.get("/download")
def download_report(db: Session = Depends(get_db)):
    rows = db.query(FeedbackAnalytics).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Participant', 'Program', 'Rating', 'Comments', 'Date'])
    for r in rows:
        writer.writerow([r.participant_name, r.program_name, r.rating, r.comments, r.submitted_date])
    output.seek(0)
    return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=feedback_report.csv"})
