from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import Complaint, ComplaintHistory
from schemas import ComplaintCreate, ComplaintUpdate
from datetime import datetime


def generate_complaint_number(db: Session) -> str:
    year = datetime.now().year
    count = db.query(Complaint).filter(
        Complaint.complaint_number.like(f"CMP-{year}-%")
    ).count()
    return f"CMP-{year}-{str(count + 1).zfill(4)}"


def get_complaints(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    category: str = None,
    priority: str = None
):
    query = db.query(Complaint)
    if status:
        query = query.filter(Complaint.status == status)
    if category:
        query = query.filter(Complaint.category == category)
    if priority:
        query = query.filter(Complaint.priority == priority)
    return query.order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()


def get_complaint(db: Session, complaint_id: int):
    return db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()


def create_complaint(db: Session, complaint: ComplaintCreate):
    complaint_number = generate_complaint_number(db)
    db_complaint = Complaint(
        complaint_number=complaint_number,
        customer_name=complaint.customer_name,
        contact_email=complaint.contact_email,
        contact_phone=complaint.contact_phone,
        category=complaint.category,
        priority=complaint.priority,
        description=complaint.description,
        status="Open"
    )
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)

    # Create initial history entry
    history_entry = ComplaintHistory(
        complaint_id=db_complaint.complaint_id,
        old_status=None,
        new_status="Open",
        updated_by="System",
        comments="Complaint registered"
    )
    db.add(history_entry)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint


def update_complaint(db: Session, complaint_id: int, update: ComplaintUpdate):
    db_complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    if not db_complaint:
        return None

    old_status = db_complaint.status

    if update.status is not None:
        db_complaint.status = update.status
    if update.assigned_to is not None:
        db_complaint.assigned_to = update.assigned_to
    if update.resolution_notes is not None:
        db_complaint.resolution_notes = update.resolution_notes

    db_complaint.updated_at = datetime.now()
    db.commit()

    # Create history entry if status changed
    if update.status is not None and update.status != old_status:
        history_entry = ComplaintHistory(
            complaint_id=complaint_id,
            old_status=old_status,
            new_status=update.status,
            updated_by=update.updated_by or "System",
            comments=update.comments
        )
        db.add(history_entry)
        db.commit()

    db.refresh(db_complaint)
    return db_complaint


def delete_complaint(db: Session, complaint_id: int):
    db_complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    if not db_complaint:
        return False
    db.delete(db_complaint)
    db.commit()
    return True


def search_complaints(
    db: Session,
    keyword: str = None,
    status: str = None,
    category: str = None,
    priority: str = None
):
    query = db.query(Complaint)
    if keyword:
        query = query.filter(
            or_(
                Complaint.customer_name.ilike(f"%{keyword}%"),
                Complaint.description.ilike(f"%{keyword}%"),
                Complaint.complaint_number.ilike(f"%{keyword}%"),
                Complaint.contact_email.ilike(f"%{keyword}%")
            )
        )
    if status:
        query = query.filter(Complaint.status == status)
    if category:
        query = query.filter(Complaint.category == category)
    if priority:
        query = query.filter(Complaint.priority == priority)
    return query.order_by(Complaint.created_at.desc()).all()


def get_complaint_history(db: Session, complaint_id: int):
    return (
        db.query(ComplaintHistory)
        .filter(ComplaintHistory.complaint_id == complaint_id)
        .order_by(ComplaintHistory.updated_at.desc())
        .all()
    )


def get_dashboard_stats(db: Session):
    total = db.query(Complaint).count()
    open_count = db.query(Complaint).filter(Complaint.status == "Open").count()
    in_progress = db.query(Complaint).filter(Complaint.status == "In Progress").count()
    escalated = db.query(Complaint).filter(Complaint.status == "Escalated").count()
    resolved = db.query(Complaint).filter(Complaint.status == "Resolved").count()
    closed = db.query(Complaint).filter(Complaint.status == "Closed").count()
    assigned = db.query(Complaint).filter(Complaint.status == "Assigned").count()
    pending = db.query(Complaint).filter(Complaint.status == "Pending Customer Response").count()
    recent = (
        db.query(Complaint)
        .order_by(Complaint.created_at.desc())
        .limit(10)
        .all()
    )
    return {
        "total": total,
        "open": open_count,
        "in_progress": in_progress,
        "escalated": escalated,
        "resolved": resolved,
        "closed": closed,
        "assigned": assigned,
        "pending_customer_response": pending,
        "recent_complaints": recent
    }
