from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import crud
import schemas

router = APIRouter(tags=["transactions"])


@router.post("/borrow", response_model=schemas.TransactionResponse, status_code=201)
def borrow_book(borrow: schemas.BorrowRequest, db: Session = Depends(get_db)):
    transaction, error = crud.borrow_book(db, borrow)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {
        "transaction_id": transaction.transaction_id,
        "book_id": transaction.book_id,
        "borrower_id": transaction.borrower_id,
        "borrow_date": transaction.borrow_date,
        "return_date": transaction.return_date,
        "book_title": transaction.book.title if transaction.book else None,
        "borrower_name": transaction.borrower.borrower_name if transaction.borrower else None,
    }


@router.post("/return", response_model=schemas.TransactionResponse)
def return_book(ret: schemas.ReturnRequest, db: Session = Depends(get_db)):
    transaction, error = crud.return_book(db, ret)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {
        "transaction_id": transaction.transaction_id,
        "book_id": transaction.book_id,
        "borrower_id": transaction.borrower_id,
        "borrow_date": transaction.borrow_date,
        "return_date": transaction.return_date,
        "book_title": transaction.book.title if transaction.book else None,
        "borrower_name": transaction.borrower.borrower_name if transaction.borrower else None,
    }


@router.get("/transactions", response_model=List[schemas.TransactionResponse])
def list_transactions(db: Session = Depends(get_db)):
    return crud.get_transactions(db)
