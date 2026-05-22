from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class FeedbackAnalytics(Base):
    __tablename__ = "feedback_analytics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    participant_name = Column(String)
    program_name = Column(String)
    rating = Column(Integer)
    comments = Column(String)
    submitted_date = Column(String)
    processed_at = Column(DateTime, default=func.now())

class ProgramSummary(Base):
    __tablename__ = "program_summary"
    id = Column(Integer, primary_key=True, autoincrement=True)
    program_name = Column(String, nullable=False)
    total_count = Column(Integer, default=0)
    avg_rating = Column(Float, default=0)
    positive_count = Column(Integer, default=0)
    negative_count = Column(Integer, default=0)
    processed_at = Column(DateTime, default=func.now())

class RatingDistribution(Base):
    __tablename__ = "rating_distribution"
    id = Column(Integer, primary_key=True, autoincrement=True)
    rating = Column(Integer, nullable=False)
    count = Column(Integer, default=0)
    percentage = Column(Float, default=0)
    processed_at = Column(DateTime, default=func.now())
