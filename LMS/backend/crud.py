from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
import models
import schemas


# ─── Book CRUD ────────────────────────────────────────────────────────────────

def get_books(db: Session, skip: int = 0, limit: int = 1000):
    return db.query(models.Book).offset(skip).limit(limit).all()


def search_books(db: Session, query: str):
    pattern = f"%{query}%"
    return db.query(models.Book).filter(
        or_(
            models.Book.title.ilike(pattern),
            models.Book.author.ilike(pattern),
            models.Book.category.ilike(pattern),
        )
    ).all()


def get_book(db: Session, book_id: int):
    return db.query(models.Book).filter(models.Book.book_id == book_id).first()


def create_book(db: Session, book: schemas.BookCreate):
    db_book = models.Book(**book.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


def update_book(db: Session, book_id: int, book: schemas.BookUpdate):
    db_book = get_book(db, book_id)
    if not db_book:
        return None
    for field, value in book.model_dump(exclude_unset=True).items():
        setattr(db_book, field, value)
    db.commit()
    db.refresh(db_book)
    return db_book


def delete_book(db: Session, book_id: int):
    db_book = get_book(db, book_id)
    if not db_book:
        return None
    db.delete(db_book)
    db.commit()
    return db_book


# ─── Borrower CRUD ────────────────────────────────────────────────────────────

def get_borrowers(db: Session, skip: int = 0, limit: int = 1000):
    return db.query(models.Borrower).offset(skip).limit(limit).all()


def get_borrower(db: Session, borrower_id: int):
    return db.query(models.Borrower).filter(models.Borrower.borrower_id == borrower_id).first()


def create_borrower(db: Session, borrower: schemas.BorrowerCreate):
    db_borrower = models.Borrower(**borrower.model_dump())
    db.add(db_borrower)
    db.commit()
    db.refresh(db_borrower)
    return db_borrower


def update_borrower(db: Session, borrower_id: int, borrower: schemas.BorrowerUpdate):
    db_borrower = get_borrower(db, borrower_id)
    if not db_borrower:
        return None
    for field, value in borrower.model_dump(exclude_unset=True).items():
        setattr(db_borrower, field, value)
    db.commit()
    db.refresh(db_borrower)
    return db_borrower


def delete_borrower(db: Session, borrower_id: int):
    db_borrower = get_borrower(db, borrower_id)
    if not db_borrower:
        return None
    db.delete(db_borrower)
    db.commit()
    return db_borrower


# ─── Transaction CRUD ─────────────────────────────────────────────────────────

def get_transactions(db: Session, skip: int = 0, limit: int = 1000):
    rows = db.query(models.Transaction).offset(skip).limit(limit).all()
    result = []
    for t in rows:
        result.append({
            "transaction_id": t.transaction_id,
            "book_id": t.book_id,
            "borrower_id": t.borrower_id,
            "borrow_date": t.borrow_date,
            "return_date": t.return_date,
            "book_title": t.book.title if t.book else None,
            "borrower_name": t.borrower.borrower_name if t.borrower else None,
        })
    return result


def get_transaction(db: Session, transaction_id: int):
    return db.query(models.Transaction).filter(
        models.Transaction.transaction_id == transaction_id
    ).first()


def borrow_book(db: Session, borrow: schemas.BorrowRequest):
    book = get_book(db, borrow.book_id)
    if not book or book.availability_status != "available":
        return None, "Book is not available"

    borrower = get_borrower(db, borrow.borrower_id)
    if not borrower:
        return None, "Borrower not found"

    transaction = models.Transaction(
        book_id=borrow.book_id,
        borrower_id=borrow.borrower_id,
    )
    db.add(transaction)

    book.availability_status = "borrowed"
    db.commit()
    db.refresh(transaction)
    return transaction, None


def return_book(db: Session, ret: schemas.ReturnRequest):
    transaction = get_transaction(db, ret.transaction_id)
    if not transaction:
        return None, "Transaction not found"
    if transaction.return_date is not None:
        return None, "Book already returned"

    transaction.return_date = datetime.utcnow()
    book = get_book(db, transaction.book_id)
    if book:
        book.availability_status = "available"
    db.commit()
    db.refresh(transaction)
    return transaction, None


def get_recent_transactions(db: Session, limit: int = 5):
    rows = (
        db.query(models.Transaction)
        .order_by(models.Transaction.transaction_id.desc())
        .limit(limit)
        .all()
    )
    result = []
    for t in rows:
        result.append({
            "transaction_id": t.transaction_id,
            "book_id": t.book_id,
            "borrower_id": t.borrower_id,
            "borrow_date": t.borrow_date,
            "return_date": t.return_date,
            "book_title": t.book.title if t.book else None,
            "borrower_name": t.borrower.borrower_name if t.borrower else None,
        })
    return result
