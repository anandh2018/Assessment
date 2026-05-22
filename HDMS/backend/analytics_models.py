from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class TicketAnalytics(Base):
    __tablename__ = "ticket_analytics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_name = Column(String)
    department = Column(String)
    issue_category = Column(String)
    priority = Column(String)
    status = Column(String)
    resolution_time_hours = Column(Float, default=0)
    created_date = Column(String)
    processed_at = Column(DateTime, default=func.now())

class CategoryAnalytics(Base):
    __tablename__ = "ticket_category_analytics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    issue_category = Column(String, nullable=False)
    total_count = Column(Integer, default=0)
    resolved_count = Column(Integer, default=0)
    avg_resolution_hours = Column(Float, default=0)
    processed_at = Column(DateTime, default=func.now())

class DepartmentAnalytics(Base):
    __tablename__ = "department_analytics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    department = Column(String, nullable=False)
    ticket_count = Column(Integer, default=0)
    resolved_count = Column(Integer, default=0)
    avg_resolution_hours = Column(Float, default=0)
    processed_at = Column(DateTime, default=func.now())

class PriorityAnalytics(Base):
    __tablename__ = "ticket_priority_analytics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    priority = Column(String, nullable=False)
    total_count = Column(Integer, default=0)
    resolved_count = Column(Integer, default=0)
    avg_resolution_hours = Column(Float, default=0)
    processed_at = Column(DateTime, default=func.now())
