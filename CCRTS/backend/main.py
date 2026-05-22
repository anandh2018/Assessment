from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
import analytics_models
from routers import complaints, analytics

# Create all tables on startup
models.Base.metadata.create_all(bind=engine)
analytics_models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Customer Complaint & Resolution Tracking System",
    description="API for managing customer complaints and tracking their resolution",
    version="1.0.0"
)

# CORS middleware — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(complaints.router, prefix="/api", tags=["complaints"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])


@app.get("/")
def root():
    return {
        "app": "Customer Complaint & Resolution Tracking System",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }
