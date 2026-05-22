from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
import crud
import schemas
from database import engine, get_db
from routers import feedback
import analytics_models
from routers import analytics as analytics_router

models.Base.metadata.create_all(bind=engine)
analytics_models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Feedback Management System API",
    description="API for managing training feedback",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feedback.router)
app.include_router(analytics_router.router)


@app.get("/")
def root():
    return {"message": "Feedback Management System API", "version": "1.0.0"}


@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    stats = crud.get_dashboard_stats(db)
    recent = [schemas.FeedbackResponse.model_validate(f) for f in stats["recent_feedback"]]
    return {
        "total_count": stats["total_count"],
        "average_rating": stats["average_rating"],
        "rating_distribution": stats["rating_distribution"],
        "recent_feedback": [r.model_dump() for r in recent],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
