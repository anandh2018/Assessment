import pandas as pd
import os
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal
from analytics_models import ComplaintAnalytics, CategorySummary, AgentPerformance, PrioritySummary

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "datasets", "complaints_dataset.csv")

def run_etl():
    """Full ETL pipeline: Extract → Transform → Load"""
    db = SessionLocal()
    try:
        # EXTRACT
        df = pd.read_csv(DATASET_PATH)

        # TRANSFORM
        # Normalize text fields
        df['priority'] = df['priority'].str.strip().str.title()
        df['status'] = df['status'].str.strip()
        df['category'] = df['category'].str.strip()
        df['assigned_to'] = df['assigned_to'].fillna('Unassigned')
        df['resolution_time_hours'] = pd.to_numeric(df['resolution_time_hours'], errors='coerce').fillna(0)
        df['sla_hours'] = pd.to_numeric(df['sla_hours'], errors='coerce').fillna(72)

        # Compute SLA breach: breached if resolved/closed AND resolution_time > sla_hours
        resolved_mask = df['status'].isin(['Resolved', 'Closed'])
        df['sla_breached'] = resolved_mask & (df['resolution_time_hours'] > df['sla_hours'])

        # Remove duplicates
        df = df.drop_duplicates(subset=['complaint_number'])

        # LOAD - clear old analytics data
        db.query(ComplaintAnalytics).delete()
        db.query(CategorySummary).delete()
        db.query(AgentPerformance).delete()
        db.query(PrioritySummary).delete()

        # Load individual complaint analytics
        for _, row in df.iterrows():
            record = ComplaintAnalytics(
                complaint_number=row['complaint_number'],
                customer_name=row['customer_name'],
                category=row['category'],
                priority=row['priority'],
                status=row['status'],
                assigned_to=row['assigned_to'],
                resolution_time_hours=float(row['resolution_time_hours']),
                sla_hours=float(row['sla_hours']),
                sla_breached=bool(row['sla_breached']),
                created_at=str(row['created_at']),
            )
            db.add(record)

        # Category summary
        for category, group in df.groupby('category'):
            resolved = group[group['status'].isin(['Resolved', 'Closed'])]
            db.add(CategorySummary(
                category=category,
                total_count=len(group),
                resolved_count=len(resolved),
                avg_resolution_hours=round(float(resolved['resolution_time_hours'].mean()) if len(resolved) > 0 else 0, 2),
                sla_breach_count=int(group['sla_breached'].sum()),
            ))

        # Agent performance
        for agent, group in df.groupby('assigned_to'):
            resolved = group[group['status'].isin(['Resolved', 'Closed'])]
            db.add(AgentPerformance(
                agent_name=agent,
                total_assigned=len(group),
                resolved_count=len(resolved),
                avg_resolution_hours=round(float(resolved['resolution_time_hours'].mean()) if len(resolved) > 0 else 0, 2),
                sla_breach_count=int(group['sla_breached'].sum()),
            ))

        # Priority summary
        for priority, group in df.groupby('priority'):
            resolved = group[group['status'].isin(['Resolved', 'Closed'])]
            total = len(group)
            breaches = int(group['sla_breached'].sum())
            db.add(PrioritySummary(
                priority=priority,
                total_count=total,
                resolved_count=len(resolved),
                avg_resolution_hours=round(float(resolved['resolution_time_hours'].mean()) if len(resolved) > 0 else 0, 2),
                breach_rate=round(breaches / total * 100, 2) if total > 0 else 0,
            ))

        db.commit()
        return {"status": "success", "records_processed": len(df)}
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

def get_etl_status():
    db = SessionLocal()
    try:
        count = db.query(ComplaintAnalytics).count()
        return {"loaded_records": count, "has_data": count > 0}
    finally:
        db.close()
