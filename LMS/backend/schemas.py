from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ─── Book Schemas ────────────────────────────────────────────────────────────

class BookCreate(BaseModel):
    title: str
    author: str
    category: Optional[str] = None
    isbn: Optional[str] = None
    availability_status: Optional[str] = "available"


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    isbn: Optional[str] = None
    availability_status: Optional[str] = None


class BookResponse(BaseModel):
    book_id: int
    title: str
    author: str
    category: Optional[str] = None
    isbn: Optional[str] = None
    availability_status: str

    class Config:
        from_attributes = True


# ─── Borrower Schemas ─────────────────────────────────────────────────────────

class BorrowerCreate(BaseModel):
    borrower_name: str
    email: Optional[str] = None
    phone: Optional[str] = None


class BorrowerUpdate(BaseModel):
    borrower_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class BorrowerResponse(BaseModel):
    borrower_id: int
    borrower_name: str
    email: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Transaction Schemas ──────────────────────────────────────────────────────

class TransactionCreate(BaseModel):
    book_id: int
    borrower_id: int


class BorrowRequest(BaseModel):
    book_id: int
    borrower_id: int


class ReturnRequest(BaseModel):
    transaction_id: int


class TransactionResponse(BaseModel):
    transaction_id: int
    book_id: int
    borrower_id: int
    borrow_date: datetime
    return_date: Optional[datetime] = None
    book_title: Optional[str] = None
    borrower_name: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Dashboard Schema ─────────────────────────────────────────────────────────

class DashboardResponse(BaseModel):
    total_books: int
    available_books: int
    borrowed_books: int
    recent_transactions: list[TransactionResponse]
