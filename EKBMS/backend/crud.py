from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import Article, Category, Comment
from schemas import (
    ArticleCreate, ArticleUpdate, ArticleApprove,
    CategoryCreate, CategoryUpdate,
    CommentCreate
)
from datetime import datetime


# ─── Article CRUD ─────────────────────────────────────────────────────────────

def get_articles(db: Session, skip: int = 0, limit: int = 100,
                 status: str = None, category_id: int = None):
    query = db.query(Article)
    if status:
        query = query.filter(Article.status == status)
    if category_id:
        query = query.filter(Article.category_id == category_id)
    return query.order_by(Article.created_at.desc()).offset(skip).limit(limit).all()


def get_article(db: Session, article_id: int):
    article = db.query(Article).filter(Article.article_id == article_id).first()
    if article:
        article.view_count = (article.view_count or 0) + 1
        db.commit()
        db.refresh(article)
    return article


def create_article(db: Session, article: ArticleCreate):
    db_article = Article(
        title=article.title,
        content=article.content,
        summary=article.summary,
        category_id=article.category_id,
        author_name=article.author_name,
        tags=article.tags,
        status="Draft",
        view_count=0,
        rating=0.0,
        rating_count=0,
    )
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article


def update_article(db: Session, article_id: int, update: ArticleUpdate):
    article = db.query(Article).filter(Article.article_id == article_id).first()
    if not article:
        return None
    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(article, key, value)
    article.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(article)
    return article


def approve_article(db: Session, article_id: int, approval: ArticleApprove):
    article = db.query(Article).filter(Article.article_id == article_id).first()
    if not article:
        return None
    article.status = approval.status
    if approval.status == "Rejected" and approval.rejection_reason:
        article.rejection_reason = approval.rejection_reason
    else:
        article.rejection_reason = None
    article.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(article)
    return article


def submit_article(db: Session, article_id: int):
    article = db.query(Article).filter(Article.article_id == article_id).first()
    if not article:
        return None
    article.status = "Pending Approval"
    article.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(article)
    return article


def delete_article(db: Session, article_id: int):
    article = db.query(Article).filter(Article.article_id == article_id).first()
    if not article:
        return False
    db.delete(article)
    db.commit()
    return True


def search_articles(db: Session, keyword: str = None, category_id: int = None,
                    tags: str = None, status: str = None):
    query = db.query(Article)
    if keyword:
        kw = f"%{keyword}%"
        query = query.filter(
            or_(
                Article.title.ilike(kw),
                Article.content.ilike(kw),
                Article.tags.ilike(kw),
                Article.summary.ilike(kw),
            )
        )
    if category_id:
        query = query.filter(Article.category_id == category_id)
    if tags:
        query = query.filter(Article.tags.ilike(f"%{tags}%"))
    if status:
        query = query.filter(Article.status == status)
    return query.order_by(Article.created_at.desc()).all()


def rate_article(db: Session, article_id: int, new_rating: float):
    article = db.query(Article).filter(Article.article_id == article_id).first()
    if not article:
        return None
    total = (article.rating or 0.0) * (article.rating_count or 0)
    article.rating_count = (article.rating_count or 0) + 1
    article.rating = (total + new_rating) / article.rating_count
    db.commit()
    db.refresh(article)
    return article


def get_pending_articles(db: Session):
    return db.query(Article).filter(
        Article.status == "Pending Approval"
    ).order_by(Article.created_at.asc()).all()


# ─── Category CRUD ────────────────────────────────────────────────────────────

def get_categories(db: Session):
    return db.query(Category).order_by(Category.category_name).all()


def get_category(db: Session, category_id: int):
    return db.query(Category).filter(Category.category_id == category_id).first()


def create_category(db: Session, category: CategoryCreate):
    db_cat = Category(
        category_name=category.category_name,
        description=category.description,
    )
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat


def update_category(db: Session, category_id: int, update: CategoryUpdate):
    cat = db.query(Category).filter(Category.category_id == category_id).first()
    if not cat:
        return None
    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(cat, key, value)
    db.commit()
    db.refresh(cat)
    return cat


def delete_category(db: Session, category_id: int):
    cat = db.query(Category).filter(Category.category_id == category_id).first()
    if not cat:
        return False
    db.delete(cat)
    db.commit()
    return True


# ─── Comment CRUD ─────────────────────────────────────────────────────────────

def get_comments(db: Session, article_id: int):
    return db.query(Comment).filter(
        Comment.article_id == article_id
    ).order_by(Comment.created_at.asc()).all()


def create_comment(db: Session, comment: CommentCreate):
    db_comment = Comment(
        article_id=comment.article_id,
        commenter_name=comment.commenter_name,
        comment_text=comment.comment_text,
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


def delete_comment(db: Session, comment_id: int):
    comment = db.query(Comment).filter(Comment.comment_id == comment_id).first()
    if not comment:
        return False
    db.delete(comment)
    db.commit()
    return True
