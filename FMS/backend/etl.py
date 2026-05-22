import pandas as pd
import os
from database import SessionLocal
from analytics_models import FeedbackAnalytics, ProgramSummary, RatingDistribution

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "datasets", "feedback_dataset.csv")

def run_etl():
    db = SessionLocal()
    try:
        # EXTRACT
        df = pd.read_csv(DATASET_PATH)

        # TRANSFORM
        df['participant_name'] = df['participant_name'].str.strip()
        df['program_name'] = df['program_name'].str.strip()
        df['rating'] = pd.to_numeric(df['rating'], errors='coerce')
        df = df[df['rating'].between(1, 5)]  # Remove invalid ratings
        df['rating'] = df['rating'].astype(int)
        df['comments'] = df['comments'].fillna('No comments provided').str.strip()
        df['submitted_date'] = df['submitted_date'].astype(str).str.strip()
        df = df.drop_duplicates(subset=['participant_name', 'program_name', 'submitted_date'])

        # LOAD
        db.query(FeedbackAnalytics).delete()
        db.query(ProgramSummary).delete()
        db.query(RatingDistribution).delete()

        for _, row in df.iterrows():
            db.add(FeedbackAnalytics(
                participant_name=row['participant_name'],
                program_name=row['program_name'],
                rating=int(row['rating']),
                comments=row['comments'],
                submitted_date=str(row['submitted_date']),
            ))

        # Program summary
        for program, group in df.groupby('program_name'):
            db.add(ProgramSummary(
                program_name=program,
                total_count=len(group),
                avg_rating=round(float(group['rating'].mean()), 2),
                positive_count=int((group['rating'] >= 4).sum()),
                negative_count=int((group['rating'] <= 2).sum()),
            ))

        # Rating distribution
        total = len(df)
        for rating in range(1, 6):
            count = int((df['rating'] == rating).sum())
            db.add(RatingDistribution(
                rating=rating,
                count=count,
                percentage=round(count / total * 100, 2) if total > 0 else 0,
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
        count = db.query(FeedbackAnalytics).count()
        return {"loaded_records": count, "has_data": count > 0}
    finally:
        db.close()
