from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional
import models
import schemas


def get_all_feedback(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    rating: Optional[int] = None,
    program_name: Optional[str] = None,
):
    query = db.query(models.Feedback)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Feedback.participant_name.ilike(search_term),
                models.Feedback.program_name.ilike(search_term),
                models.Feedback.comments.ilike(search_term),
            )
        )

    if rating is not None:
        query = query.filter(models.Feedback.rating == rating)

    if program_name:
        query = query.filter(
            models.Feedback.program_name.ilike(f"%{program_name}%")
        )

    return query.order_by(models.Feedback.submitted_at.desc()).offset(skip).limit(limit).all()


def get_feedback_by_id(db: Session, feedback_id: int):
    return db.query(models.Feedback).filter(models.Feedback.feedback_id == feedback_id).first()


def create_feedback(db: Session, feedback: schemas.FeedbackCreate):
    db_feedback = models.Feedback(
        participant_name=feedback.participant_name,
        program_name=feedback.program_name,
        rating=feedback.rating,
        comments=feedback.comments,
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback


def update_feedback(db: Session, feedback_id: int, feedback: schemas.FeedbackUpdate):
    db_feedback = get_feedback_by_id(db, feedback_id)
    if db_feedback is None:
        return None

    update_data = feedback.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_feedback, field, value)

    db.commit()
    db.refresh(db_feedback)
    return db_feedback


def delete_feedback(db: Session, feedback_id: int):
    db_feedback = get_feedback_by_id(db, feedback_id)
    if db_feedback is None:
        return None
    db.delete(db_feedback)
    db.commit()
    return db_feedback


def get_dashboard_stats(db: Session):
    total_count = db.query(func.count(models.Feedback.feedback_id)).scalar()

    avg_rating_result = db.query(func.avg(models.Feedback.rating)).scalar()
    average_rating = round(float(avg_rating_result), 2) if avg_rating_result else 0.0

    rating_distribution = {}
    for i in range(1, 6):
        count = db.query(func.count(models.Feedback.feedback_id)).filter(
            models.Feedback.rating == i
        ).scalar()
        rating_distribution[str(i)] = count

    recent_feedback = (
        db.query(models.Feedback)
        .order_by(models.Feedback.submitted_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_count": total_count,
        "average_rating": average_rating,
        "rating_distribution": rating_distribution,
        "recent_feedback": recent_feedback,
    }
