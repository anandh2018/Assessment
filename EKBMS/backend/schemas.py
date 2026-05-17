from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ─── Category Schemas ────────────────────────────────────────────────────────

class CategoryCreate(BaseModel):
    category_name: str
    description: Optional[str] = None


class CategoryUpdate(BaseModel):
    category_name: Optional[str] = None
    description: Optional[str] = None


class CategoryResponse(BaseModel):
    category_id: int
    category_name: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Comment Schemas ──────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    article_id: int
    commenter_name: str
    comment_text: str


class CommentResponse(BaseModel):
    comment_id: int
    article_id: int
    commenter_name: str
    comment_text: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Article Schemas ──────────────────────────────────────────────────────────

class ArticleCreate(BaseModel):
    title: str
    content: str
    summary: Optional[str] = None
    category_id: Optional[int] = None
    author_name: str
    tags: Optional[str] = None


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    category_id: Optional[int] = None
    tags: Optional[str] = None
    status: Optional[str] = None
    rejection_reason: Optional[str] = None


class ArticleApprove(BaseModel):
    status: str = Field(..., pattern="^(Approved|Rejected)$")
    rejection_reason: Optional[str] = None


class RatingCreate(BaseModel):
    rating: float = Field(..., ge=1, le=5)


class ArticleResponse(BaseModel):
    article_id: int
    title: str
    content: str
    summary: Optional[str] = None
    category_id: Optional[int] = None
    category: Optional[CategoryResponse] = None
    author_name: str
    tags: Optional[str] = None
    status: str
    rejection_reason: Optional[str] = None
    view_count: int
    rating: float
    rating_count: int
    created_at: datetime
    updated_at: datetime
    comments: Optional[List[CommentResponse]] = []

    class Config:
        from_attributes = True
