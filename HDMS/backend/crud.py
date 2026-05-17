from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
import models
import schemas


def get_tickets(db: Session, skip: int = 0, limit: int = 100,
                status: Optional[str] = None,
                category: Optional[str] = None,
                priority: Optional[str] = None):
    query = db.query(models.Ticket)
    if status:
        query = query.filter(models.Ticket.status == status)
    if category:
        query = query.filter(models.Ticket.issue_category == category)
    if priority:
        query = query.filter(models.Ticket.priority == priority)
    return query.order_by(models.Ticket.created_at.desc()).offset(skip).limit(limit).all()


def get_ticket(db: Session, ticket_id: int):
    return db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()


def create_ticket(db: Session, ticket: schemas.TicketCreate):
    db_ticket = models.Ticket(
        employee_name=ticket.employee_name,
        department=ticket.department,
        issue_category=ticket.issue_category,
        description=ticket.description,
        priority=ticket.priority,
        status="Open",
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def update_ticket(db: Session, ticket_id: int, ticket_update: schemas.TicketUpdate):
    db_ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if not db_ticket:
        return None
    update_data = ticket_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_ticket, field, value)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def delete_ticket(db: Session, ticket_id: int):
    db_ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if not db_ticket:
        return None
    db.delete(db_ticket)
    db.commit()
    return db_ticket


def search_tickets(db: Session, keyword: Optional[str] = None,
                   category: Optional[str] = None,
                   status: Optional[str] = None,
                   priority: Optional[str] = None):
    query = db.query(models.Ticket)
    if keyword:
        keyword_filter = f"%{keyword}%"
        query = query.filter(
            or_(
                models.Ticket.employee_name.ilike(keyword_filter),
                models.Ticket.department.ilike(keyword_filter),
                models.Ticket.description.ilike(keyword_filter),
                models.Ticket.issue_category.ilike(keyword_filter),
            )
        )
    if category:
        query = query.filter(models.Ticket.issue_category == category)
    if status:
        query = query.filter(models.Ticket.status == status)
    if priority:
        query = query.filter(models.Ticket.priority == priority)
    return query.order_by(models.Ticket.created_at.desc()).all()
