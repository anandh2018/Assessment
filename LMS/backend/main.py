from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db, Base
import models
import analytics_models
import crud
import schemas
from routers import books, borrowers, transactions
from routers import analytics as analytics_router

# Create all database tables
Base.metadata.create_all(bind=engine)
analytics_models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Library Management System", version="1.0.0")

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(books.router)
app.include_router(borrowers.router)
app.include_router(transactions.router)
app.include_router(analytics_router.router)


@app.get("/")
def root():
    return {"message": "Library Management System API"}


@app.get("/dashboard", response_model=schemas.DashboardResponse)
def dashboard(db: Session = Depends(get_db)):
    all_books = crud.get_books(db)
    total_books = len(all_books)
    available_books = sum(1 for b in all_books if b.availability_status == "available")
    borrowed_books = total_books - available_books
    recent = crud.get_recent_transactions(db, limit=5)
    return {
        "total_books": total_books,
        "available_books": available_books,
        "borrowed_books": borrowed_books,
        "recent_transactions": recent,
    }
