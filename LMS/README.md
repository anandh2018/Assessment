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
