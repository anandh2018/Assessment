from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import crud
import schemas

router = APIRouter()


@router.get("", response_model=List[schemas.ArticleResponse])
def list_articles(
    status: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return crud.get_articles(db, skip=skip, limit=limit, status=status, category_id=category_id)


@router.get("/search", response_model=List[schemas.ArticleResponse])
def search_articles(
    keyword: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    tags: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return crud.search_articles(db, keyword=keyword, category_id=category_id, tags=tags, status=status)


@router.get("/{article_id}", response_model=schemas.ArticleResponse)
def get_article(article_id: int, db: Session = Depends(get_db)):
    article = crud.get_article(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.post("", response_model=schemas.ArticleResponse, status_code=201)
def create_article(article: schemas.ArticleCreate, db: Session = Depends(get_db)):
    return crud.create_article(db, article)


@router.put("/{article_id}", response_model=schemas.ArticleResponse)
def update_article(article_id: int, update: schemas.ArticleUpdate, db: Session = Depends(get_db)):
    article = crud.update_article(db, article_id, update)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.delete("/{article_id}")
def delete_article(article_id: int, db: Session = Depends(get_db)):
    success = crud.delete_article(db, article_id)
    if not success:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article deleted successfully"}


@router.post("/{article_id}/submit", response_model=schemas.ArticleResponse)
def submit_article(article_id: int, db: Session = Depends(get_db)):
    article = crud.submit_article(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.post("/{article_id}/approve", response_model=schemas.ArticleResponse)
def approve_article(
    article_id: int,
    approval: schemas.ArticleApprove,
    db: Session = Depends(get_db),
):
    article = crud.approve_article(db, article_id, approval)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.get("/{article_id}/comments", response_model=List[schemas.CommentResponse])
def get_comments(article_id: int, db: Session = Depends(get_db)):
    return crud.get_comments(db, article_id)


@router.post("/{article_id}/comments", response_model=schemas.CommentResponse, status_code=201)
def add_comment(
    article_id: int,
    comment: schemas.CommentCreate,
    db: Session = Depends(get_db),
):
    article = crud.get_article(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return crud.create_comment(db, comment)


@router.post("/{article_id}/rate", response_model=schemas.ArticleResponse)
def rate_article(
    article_id: int,
    rating_data: schemas.RatingCreate,
    db: Session = Depends(get_db),
):
    article = crud.rate_article(db, article_id, rating_data.rating)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article
