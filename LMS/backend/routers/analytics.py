from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from analytics_models import BorrowAnalytics, BookPopularity, CategoryBorrowStats, MonthlyTrend
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
    total = db.query(BorrowAnalytics).count()
    overdue = db.query(BorrowAnalytics).filter(BorrowAnalytics.is_overdue == True).count()
    returned = db.query(BorrowAnalytics).filter(BorrowAnalytics.return_date != '').count()
    return {"total_transactions": total, "overdue_count": overdue, "returned_count": returned}

@router.get("/popular-books")
def get_popular_books(db: Session = Depends(get_db)):
    rows = db.query(BookPopularity).order_by(BookPopularity.borrow_count.desc()).limit(10).all()
    return [{"book_title": r.book_title, "author": r.author, "category": r.category, "borrow_count": r.borrow_count} for r in rows]

@router.get("/categories")
def get_category_stats(db: Session = Depends(get_db)):
    rows = db.query(CategoryBorrowStats).order_by(CategoryBorrowStats.borrow_count.desc()).all()
    return [{"category": r.category, "borrow_count": r.borrow_count, "overdue_count": r.overdue_count} for r in rows]

@router.get("/monthly-trends")
def get_monthly_trends(db: Session = Depends(get_db)):
    rows = db.query(MonthlyTrend).order_by(MonthlyTrend.year_month).all()
    return [{"year_month": r.year_month, "borrow_count": r.borrow_count, "overdue_count": r.overdue_count} for r in rows]

@router.get("/overdue")
def get_overdue(db: Session = Depends(get_db)):
    rows = db.query(BorrowAnalytics).filter(BorrowAnalytics.is_overdue == True).all()
    return [{"book_title": r.book_title, "borrower_name": r.borrower_name, "borrow_date": r.borrow_date, "due_date": r.due_date} for r in rows]
