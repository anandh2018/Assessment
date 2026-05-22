from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class BorrowAnalytics(Base):
    __tablename__ = "borrow_analytics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    book_title = Column(String)
    author = Column(String)
    category = Column(String)
    borrower_name = Column(String)
    borrow_date = Column(String)
    due_date = Column(String)
    return_date = Column(String)
    is_overdue = Column(Boolean, default=False)
    processed_at = Column(DateTime, default=func.now())

class BookPopularity(Base):
    __tablename__ = "book_popularity"
    id = Column(Integer, primary_key=True, autoincrement=True)
    book_title = Column(String)
    author = Column(String)
    category = Column(String)
    borrow_count = Column(Integer, default=0)
    processed_at = Column(DateTime, default=func.now())

class CategoryBorrowStats(Base):
    __tablename__ = "category_borrow_stats"
    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String, nullable=False)
    borrow_count = Column(Integer, default=0)
    overdue_count = Column(Integer, default=0)
    processed_at = Column(DateTime, default=func.now())

class MonthlyTrend(Base):
    __tablename__ = "monthly_borrow_trends"
    id = Column(Integer, primary_key=True, autoincrement=True)
    year_month = Column(String, nullable=False)
    borrow_count = Column(Integer, default=0)
    overdue_count = Column(Integer, default=0)
    processed_at = Column(DateTime, default=func.now())
