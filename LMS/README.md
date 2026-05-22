# Library Management System

A full-stack Library Management System (LMS) built with FastAPI (Python) and React (Vite).

## Features

- Browse, add, edit, and delete books
- Manage library members (borrowers)
- Borrow and return books with automatic availability tracking
- Dashboard with live statistics (total, available, borrowed books)
- Full-text search across title, author, and category with optional filters

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Python 3.11+, FastAPI, SQLAlchemy   |
| Database  | SQLite (file: `backend/library.db`) |
| Validation| Pydantic v2                         |
| Frontend  | React 18, Vite, React Router v6     |
| HTTP      | Axios                               |

## Project Structure

```
LMS/
├── backend/          # FastAPI application
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── crud.py
│   ├── routers/
│   │   ├── books.py
│   │   ├── borrowers.py
│   │   └── transactions.py
│   └── requirements.txt
├── frontend/         # React + Vite application
│   └── src/
│       ├── api.js
│       ├── App.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Books.jsx
│           ├── Borrowers.jsx
│           ├── Transactions.jsx
│           └── Search.jsx
├── database/
│   └── schema.sql
└── README.md
```

## Setup & Running

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at http://localhost:8000  
Interactive docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at http://localhost:5173

## API Endpoints

| Method | Endpoint          | Description                        |
|--------|-------------------|------------------------------------|
| GET    | /dashboard        | Stats + recent transactions        |
| GET    | /books            | List all books (supports ?search=) |
| GET    | /books/{id}       | Get book by ID                     |
| POST   | /books            | Create a new book                  |
| PUT    | /books/{id}       | Update a book                      |
| DELETE | /books/{id}       | Delete a book                      |
| GET    | /borrowers        | List all borrowers                 |
| POST   | /borrowers        | Create a new borrower              |
| PUT    | /borrowers/{id}   | Update a borrower                  |
| DELETE | /borrowers/{id}   | Delete a borrower                  |
| POST   | /borrow           | Borrow a book                      |
| POST   | /return           | Return a book                      |
| GET    | /transactions     | List all transactions              |

---

## Phase 2 — ETL Pipeline

Phase 2 extends the system with a Python/Pandas ETL pipeline for transaction analytics and borrowing trend reports.

### ETL Workflow

```
datasets/library_transactions.csv
        │
        ▼ EXTRACT (pandas.read_csv)
        │
        ▼ TRANSFORM
        │  • Strip/normalize text fields
        │  • Normalize is_overdue to boolean
        │  • Remove duplicate transactions (book + borrower + date)
        │  • Extract year-month for trend grouping
        │
        ▼ LOAD (SQLite analytics tables)
        │  • borrow_analytics        — individual cleaned transactions
        │  • book_popularity         — borrow count per book
        │  • category_borrow_stats   — category-wise borrowing + overdue
        │  • monthly_borrow_trends   — monthly borrowing counts
```

### Running the ETL

**Via API:**
```bash
curl -X POST http://localhost:8000/analytics/etl/run
```

**Via Dashboard UI:**  
Open the app → scroll to "ETL Analytics Pipeline" section → click "Run ETL".

### ETL Analytics Endpoints

| Method | Endpoint                     | Description                        |
|--------|------------------------------|------------------------------------|
| POST   | /analytics/etl/run           | Trigger the ETL pipeline           |
| GET    | /analytics/etl/status        | Check if ETL data is loaded        |
| GET    | /analytics/summary           | Total transactions, overdue count  |
| GET    | /analytics/popular-books     | Top 10 most borrowed books         |
| GET    | /analytics/categories        | Category-wise borrowing stats      |
| GET    | /analytics/monthly-trends    | Monthly borrowing trends           |
| GET    | /analytics/overdue           | List of overdue transactions       |

### Dataset

`datasets/library_transactions.csv` — 180 sample transaction records covering 40 book titles, 25 borrowers, 8 categories, with dates from Oct 2024 – Mar 2025.

### Updated Project Structure (Phase 2)

```
LMS/
├── datasets/
│   └── library_transactions.csv   # ETL input dataset (180 records)
├── backend/
│   ├── analytics_models.py        # ETL analytics models (Phase 2)
│   ├── etl.py                     # ETL pipeline (Phase 2)
│   ├── routers/
│   │   ├── books.py
│   │   ├── borrowers.py
│   │   ├── transactions.py
│   │   └── analytics.py           # ETL analytics routes (Phase 2)
│   └── ...
└── ...
```
