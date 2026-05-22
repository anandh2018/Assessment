from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from analytics_models import ArticleAnalytics, CategoryAnalytics, AuthorAnalytics, TopArticle
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
    from sqlalchemy import func
    total = db.query(ArticleAnalytics).count()
    total_views = db.query(func.sum(ArticleAnalytics.view_count)).scalar() or 0
    avg_rating = db.query(func.avg(ArticleAnalytics.rating)).scalar() or 0
    return {"total_records": total, "total_views": int(total_views), "avg_rating": round(float(avg_rating), 2)}

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    rows = db.query(CategoryAnalytics).order_by(CategoryAnalytics.total_views.desc()).all()
    return [{"category_name": r.category_name, "article_count": r.article_count, "total_views": r.total_views, "avg_rating": r.avg_rating} for r in rows]

@router.get("/authors")
def get_authors(db: Session = Depends(get_db)):
    rows = db.query(AuthorAnalytics).order_by(AuthorAnalytics.total_views.desc()).all()
    return [{"author_name": r.author_name, "article_count": r.article_count, "total_views": r.total_views, "avg_rating": r.avg_rating} for r in rows]

@router.get("/top-articles")
def get_top_articles(db: Session = Depends(get_db)):
    rows = db.query(TopArticle).order_by(TopArticle.view_count.desc()).all()
    return [{"title": r.title, "category": r.category, "author_name": r.author_name, "view_count": r.view_count, "rating": r.rating} for r in rows]
