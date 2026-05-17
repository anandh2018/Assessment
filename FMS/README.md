# Feedback Management System

## Overview

The Feedback Management System (FMS) is a full-stack web application that enables organizations to collect, manage, and analyze training program feedback. Participants submit structured feedback with ratings and comments, and administrators can view analytics via a real-time dashboard.

## Features

- Submit feedback with participant name, program name, star rating (1-5), and comments
- Dashboard with total count, average rating, rating distribution, and recent entries
- Full CRUD operations (create, read, update, delete) on feedback records
- Keyword search across participant names, program names, and comments
- Filter by rating (1-5) and program name
- Inline edit modal with pre-filled form
- Delete confirmation workflow
- Form validation on both frontend and backend
- Responsive design

## Tech Stack

| Layer    | Technology                         |
|----------|------------------------------------|
| Backend  | Python 3, FastAPI, SQLAlchemy ORM  |
| Database | SQLite                             |
| Frontend | React 18, Vite, React Router DOM   |
| HTTP     | Axios                              |

---

## Backend Setup

### Prerequisites
- Python 3.8+
- pip3

### Install dependencies

```bash
cd backend
pip3 install -r requirements.txt
```

### Run the backend

```bash
cd backend
python3 main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

The API will be available at: http://localhost:8001

Interactive API docs: http://localhost:8001/docs

---

## Frontend Setup

### Prerequisites
- Node.js 18+
- npm

### Install dependencies

```bash
cd frontend
npm install
```

### Run the frontend

```bash
cd frontend
npm run dev
```

The app will be available at: http://localhost:5173 (or http://localhost:5174)

---

## API Endpoints

| Method | Path                  | Description                                      |
|--------|-----------------------|--------------------------------------------------|
| GET    | /                     | Health check / API info                          |
| GET    | /dashboard            | Dashboard stats (total, avg rating, distribution, recent) |
| GET    | /feedback             | List all feedback (with optional filters)        |
| GET    | /feedback/{id}        | Get a single feedback entry by ID                |
| POST   | /feedback             | Submit new feedback                              |
| PUT    | /feedback/{id}        | Update an existing feedback entry                |
| DELETE | /feedback/{id}        | Delete a feedback entry                          |
| GET    | /feedback/search      | Search feedback (query, rating, program_name)    |

### Query parameters for GET /feedback

| Param        | Type    | Description                        |
|--------------|---------|------------------------------------|
| search       | string  | Keyword search across all text fields |
| rating       | int 1-5 | Filter by exact rating             |
| program_name | string  | Filter by program name (partial)   |
| skip         | int     | Pagination offset (default 0)      |
| limit        | int     | Max records to return (default 100)|

---

## How to Run

### Start backend (port 8001)

```bash
cd "/path/to/FMS/backend"
pip3 install -r requirements.txt
python3 main.py
```

### Start frontend

```bash
cd "/path/to/FMS/frontend"
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

> Note: The backend runs on port **8001** to avoid conflicts with other services.

---

## Project Structure

```
FMS/
├── backend/
│   ├── main.py          # FastAPI app entry point
│   ├── database.py      # SQLAlchemy engine and session
│   ├── models.py        # ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── crud.py          # Database operations
│   ├── routers/
│   │   └── feedback.py  # Feedback API routes
│   └── requirements.txt
├── frontend/            # React + Vite app
│   └── src/
│       ├── api.js       # Axios base config
│       ├── App.jsx      # Root component with routing
│       └── pages/
│           ├── Dashboard.jsx
│           ├── FeedbackList.jsx
│           ├── SubmitFeedback.jsx
│           └── Search.jsx
├── database/
│   └── schema.sql       # SQL schema reference
├── README.md
└── .gitignore
```
