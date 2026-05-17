from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import tickets

# Create all database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Helpdesk Ticket Management System",
    description="A full-stack helpdesk system for managing IT support tickets",
    version="1.0.0",
)

# CORS configuration — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tickets.router, prefix="/api", tags=["tickets"])


@app.get("/", tags=["root"])
def root():
    return {
        "app": "Helpdesk Ticket Management System",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", tags=["root"])
def health_check():
    return {"status": "healthy"}
