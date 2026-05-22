import pandas as pd
import os
from database import SessionLocal
from analytics_models import BorrowAnalytics, BookPopularity, CategoryBorrowStats, MonthlyTrend

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "datasets", "library_transactions.csv")

def run_etl():
    db = SessionLocal()
    try:
        # EXTRACT
        df = pd.read_csv(DATASET_PATH)

        # TRANSFORM
        df['book_title'] = df['book_title'].str.strip()
        df['author'] = df['author'].str.strip()
        df['category'] = df['category'].str.strip()
        df['borrower_name'] = df['borrower_name'].str.strip()
        df['borrow_date'] = df['borrow_date'].astype(str).str.strip()
        df['due_date'] = df['due_date'].fillna('').astype(str).str.strip()
        df['return_date'] = df['return_date'].fillna('').astype(str).str.strip()
        # Normalize is_overdue
        df['is_overdue'] = df['is_overdue'].astype(str).str.lower().isin(['true', '1', 'yes'])
        # Remove duplicates
        df = df.drop_duplicates(subset=['book_title', 'borrower_name', 'borrow_date'])
        # Extract year-month
        df['year_month'] = df['borrow_date'].str[:7]

        # LOAD
        db.query(BorrowAnalytics).delete()
        db.query(BookPopularity).delete()
        db.query(CategoryBorrowStats).delete()
        db.query(MonthlyTrend).delete()

        for _, row in df.iterrows():
            db.add(BorrowAnalytics(
                book_title=row['book_title'],
                author=row['author'],
                category=row['category'],
                borrower_name=row['borrower_name'],
                borrow_date=str(row['borrow_date']),
                due_date=str(row['due_date']),
                return_date=str(row['return_date']) if row['return_date'] else '',
                is_overdue=bool(row['is_overdue']),
            ))

        # Book popularity
        for (title, author, cat), group in df.groupby(['book_title', 'author', 'category']):
            db.add(BookPopularity(
                book_title=title,
                author=author,
                category=cat,
                borrow_count=len(group),
            ))

        # Category stats
        for cat, group in df.groupby('category'):
            db.add(CategoryBorrowStats(
                category=cat,
                borrow_count=len(group),
                overdue_count=int(group['is_overdue'].sum()),
            ))

        # Monthly trends
        for ym, group in df.groupby('year_month'):
            db.add(MonthlyTrend(
                year_month=ym,
                borrow_count=len(group),
                overdue_count=int(group['is_overdue'].sum()),
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
        count = db.query(BorrowAnalytics).count()
        return {"loaded_records": count, "has_data": count > 0}
    finally:
        db.close()
