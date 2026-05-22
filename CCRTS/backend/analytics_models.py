from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class ComplaintAnalytics(Base):
    __tablename__ = "complaint_analytics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_number = Column(String, nullable=False)
    customer_name = Column(String)
    category = Column(String)
    priority = Column(String)
    status = Column(String)
    assigned_to = Column(String)
    resolution_time_hours = Column(Float, default=0)
    sla_hours = Column(Float, default=0)
    sla_breached = Column(Boolean, default=False)
    created_at = Column(String)
    processed_at = Column(DateTime, default=func.now())

class CategorySummary(Base):
    __tablename__ = "category_summary"
    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String, nullable=False)
    total_count = Column(Integer, default=0)
    resolved_count = Column(Integer, default=0)
    avg_resolution_hours = Column(Float, default=0)
    sla_breach_count = Column(Integer, default=0)
    processed_at = Column(DateTime, default=func.now())

class AgentPerformance(Base):
    __tablename__ = "agent_performance"
    id = Column(Integer, primary_key=True, autoincrement=True)
    agent_name = Column(String, nullable=False)
    total_assigned = Column(Integer, default=0)
    resolved_count = Column(Integer, default=0)
    avg_resolution_hours = Column(Float, default=0)
    sla_breach_count = Column(Integer, default=0)
    processed_at = Column(DateTime, default=func.now())

class PrioritySummary(Base):
    __tablename__ = "priority_summary"
    id = Column(Integer, primary_key=True, autoincrement=True)
    priority = Column(String, nullable=False)
    total_count = Column(Integer, default=0)
    resolved_count = Column(Integer, default=0)
    avg_resolution_hours = Column(Float, default=0)
    breach_rate = Column(Float, default=0)
    processed_at = Column(DateTime, default=func.now())
