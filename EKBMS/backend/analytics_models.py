from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class ArticleAnalytics(Base):
    __tablename__ = "article_analytics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String)
    category = Column(String)
    tags = Column(String)
    author_name = Column(String)
    view_count = Column(Integer, default=0)
    rating = Column(Float, default=0)
    status = Column(String)
    created_at = Column(String)
    processed_at = Column(DateTime, default=func.now())

class CategoryAnalytics(Base):
    __tablename__ = "kb_category_analytics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    category_name = Column(String, nullable=False)
    article_count = Column(Integer, default=0)
    total_views = Column(Integer, default=0)
    avg_rating = Column(Float, default=0)
    processed_at = Column(DateTime, default=func.now())

class AuthorAnalytics(Base):
    __tablename__ = "author_analytics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    author_name = Column(String, nullable=False)
    article_count = Column(Integer, default=0)
    total_views = Column(Integer, default=0)
    avg_rating = Column(Float, default=0)
    processed_at = Column(DateTime, default=func.now())

class TopArticle(Base):
    __tablename__ = "top_articles"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String)
    category = Column(String)
    author_name = Column(String)
    view_count = Column(Integer, default=0)
    rating = Column(Float, default=0)
    processed_at = Column(DateTime, default=func.now())
