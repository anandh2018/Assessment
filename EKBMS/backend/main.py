from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
import models
from routers import articles, categories
from schemas import CategoryCreate
import crud

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Enterprise Knowledge Base Management System",
    description="EKBMS API for managing knowledge articles, categories, and approvals",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(articles.router, prefix="/api/articles", tags=["Articles"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])


# Seed default categories on startup
DEFAULT_CATEGORIES = [
    {"name": "HR Policies", "desc": "Human resources policies, procedures, and guidelines"},
    {"name": "IT Support", "desc": "IT helpdesk guides, troubleshooting, and FAQs"},
    {"name": "Infrastructure", "desc": "Network, server, and infrastructure documentation"},
    {"name": "Training Materials", "desc": "Onboarding guides, training resources, and tutorials"},
    {"name": "Finance", "desc": "Finance policies, expense reports, and budget guidelines"},
    {"name": "Operations", "desc": "Operational procedures, workflows, and best practices"},
]


@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    try:
        existing = crud.get_categories(db)
        existing_names = {c.category_name for c in existing}
        for cat in DEFAULT_CATEGORIES:
            if cat["name"] not in existing_names:
                crud.create_category(
                    db,
                    CategoryCreate(category_name=cat["name"], description=cat["desc"]),
                )
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": "Enterprise Knowledge Base Management System API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
