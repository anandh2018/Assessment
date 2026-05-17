from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import crud
import schemas
from database import get_db

router = APIRouter()


@router.get("/tickets", response_model=List[schemas.TicketResponse])
def get_all_tickets(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    tickets = crud.get_tickets(db, skip=skip, limit=limit,
                               status=status, category=category, priority=priority)
    return tickets


@router.get("/search", response_model=List[schemas.TicketResponse])
def search_tickets(
    keyword: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    tickets = crud.search_tickets(db, keyword=keyword, category=category,
                                  status=status, priority=priority)
    return tickets


@router.get("/tickets/{ticket_id}", response_model=schemas.TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = crud.get_ticket(db, ticket_id=ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail=f"Ticket #{ticket_id} not found")
    return ticket


@router.post("/tickets", response_model=schemas.TicketResponse, status_code=201)
def create_ticket(ticket: schemas.TicketCreate, db: Session = Depends(get_db)):
    return crud.create_ticket(db=db, ticket=ticket)


@router.put("/tickets/{ticket_id}", response_model=schemas.TicketResponse)
def update_ticket(ticket_id: int, ticket_update: schemas.TicketUpdate,
                  db: Session = Depends(get_db)):
    updated = crud.update_ticket(db=db, ticket_id=ticket_id, ticket_update=ticket_update)
    if updated is None:
        raise HTTPException(status_code=404, detail=f"Ticket #{ticket_id} not found")
    return updated


@router.delete("/tickets/{ticket_id}", status_code=200)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_ticket(db=db, ticket_id=ticket_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail=f"Ticket #{ticket_id} not found")
    return {"message": f"Ticket #{ticket_id} deleted successfully"}
