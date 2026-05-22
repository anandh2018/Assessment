import pandas as pd
import os
from database import SessionLocal
from analytics_models import ArticleAnalytics, CategoryAnalytics, AuthorAnalytics, TopArticle

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "datasets", "articles_dataset.csv")

def run_etl():
    db = SessionLocal()
    try:
        # EXTRACT
        df = pd.read_csv(DATASET_PATH)

        # TRANSFORM
        df['title'] = df['title'].str.strip()
        df['category'] = df['category'].str.strip()
        df['author_name'] = df['author_name'].str.strip()
        df['tags'] = df['tags'].fillna('').str.strip().str.lower()
        df['view_count'] = pd.to_numeric(df['view_count'], errors='coerce').fillna(0).astype(int)
        df['rating'] = pd.to_numeric(df['rating'], errors='coerce').fillna(0).round(1)
        df['status'] = df['status'].str.strip()
        df['created_at'] = df['created_at'].astype(str).str.strip()
        df = df.drop_duplicates(subset=['title'])
        df = df[df['title'].str.len() > 0]

        # LOAD
        db.query(ArticleAnalytics).delete()
        db.query(CategoryAnalytics).delete()
        db.query(AuthorAnalytics).delete()
        db.query(TopArticle).delete()

        for _, row in df.iterrows():
            db.add(ArticleAnalytics(
                title=row['title'],
                category=row['category'],
                tags=row['tags'],
                author_name=row['author_name'],
                view_count=int(row['view_count']),
                rating=float(row['rating']),
                status=row['status'],
                created_at=str(row['created_at']),
            ))

        # Category analytics
        for cat, group in df.groupby('category'):
            db.add(CategoryAnalytics(
                category_name=cat,
                article_count=len(group),
                total_views=int(group['view_count'].sum()),
                avg_rating=round(float(group['rating'].mean()), 2),
            ))

        # Author analytics
        for author, group in df.groupby('author_name'):
            db.add(AuthorAnalytics(
                author_name=author,
                article_count=len(group),
                total_views=int(group['view_count'].sum()),
                avg_rating=round(float(group['rating'].mean()), 2),
            ))

        # Top 10 articles by views
        top = df.nlargest(10, 'view_count')
        for _, row in top.iterrows():
            db.add(TopArticle(
                title=row['title'],
                category=row['category'],
                author_name=row['author_name'],
                view_count=int(row['view_count']),
                rating=float(row['rating']),
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
        count = db.query(ArticleAnalytics).count()
        return {"loaded_records": count, "has_data": count > 0}
    finally:
        db.close()
