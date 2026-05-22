import pandas as pd
import os
from database import SessionLocal
from analytics_models import TicketAnalytics, CategoryAnalytics, DepartmentAnalytics, PriorityAnalytics

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "datasets", "tickets_dataset.csv")

def run_etl():
    db = SessionLocal()
    try:
        # EXTRACT
        df = pd.read_csv(DATASET_PATH)

        # TRANSFORM
        df['employee_name'] = df['employee_name'].str.strip()
        df['department'] = df['department'].str.strip()
        df['issue_category'] = df['issue_category'].str.strip()
        df['priority'] = df['priority'].str.strip().str.title()
        df['status'] = df['status'].str.strip()
        df['resolution_time_hours'] = pd.to_numeric(df['resolution_time_hours'], errors='coerce').fillna(0)
        df['created_date'] = df['created_date'].astype(str).str.strip()
        df = df.drop_duplicates(subset=['employee_name', 'issue_category', 'created_date'])

        # LOAD
        db.query(TicketAnalytics).delete()
        db.query(CategoryAnalytics).delete()
        db.query(DepartmentAnalytics).delete()
        db.query(PriorityAnalytics).delete()

        for _, row in df.iterrows():
            db.add(TicketAnalytics(
                employee_name=row['employee_name'],
                department=row['department'],
                issue_category=row['issue_category'],
                priority=row['priority'],
                status=row['status'],
                resolution_time_hours=float(row['resolution_time_hours']),
                created_date=str(row['created_date']),
            ))

        for category, group in df.groupby('issue_category'):
            resolved = group[group['status'].isin(['Resolved', 'Closed'])]
            db.add(CategoryAnalytics(
                issue_category=category,
                total_count=len(group),
                resolved_count=len(resolved),
                avg_resolution_hours=round(float(resolved['resolution_time_hours'].mean()) if len(resolved) > 0 else 0, 2),
            ))

        for dept, group in df.groupby('department'):
            resolved = group[group['status'].isin(['Resolved', 'Closed'])]
            db.add(DepartmentAnalytics(
                department=dept,
                ticket_count=len(group),
                resolved_count=len(resolved),
                avg_resolution_hours=round(float(resolved['resolution_time_hours'].mean()) if len(resolved) > 0 else 0, 2),
            ))

        for priority, group in df.groupby('priority'):
            resolved = group[group['status'].isin(['Resolved', 'Closed'])]
            db.add(PriorityAnalytics(
                priority=priority,
                total_count=len(group),
                resolved_count=len(resolved),
                avg_resolution_hours=round(float(resolved['resolution_time_hours'].mean()) if len(resolved) > 0 else 0, 2),
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
        count = db.query(TicketAnalytics).count()
        return {"loaded_records": count, "has_data": count > 0}
    finally:
        db.close()
