# Enterprise Knowledge Base Management System (EKBMS)

A full-stack knowledge base platform built with FastAPI (Python) and React (Vite), with SQLite for persistent storage. Supports article creation, approval workflows, categories, ratings, and comments.

## Features

- Create, review, approve, reject, and archive knowledge articles
- Category management with default seeded categories
- Article ratings and view tracking
- Comment system on articles
- Dashboard with article statistics and category breakdown
- Search and filter by status, category, author

## Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Frontend  | React 18, React Router v6, Axios, Vite    |
| Backend   | Python 3.10+, FastAPI, Uvicorn            |
| Database  | SQLite (via SQLAlchemy 2.0)               |
| Styling   | CSS variables / Inline styles             |

---

## Setup & Running

### Backend

```bash
cd EKBMS/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API available at: http://localhost:8000  
Interactive docs: http://localhost:8000/docs

### Frontend

```bash
cd EKBMS/frontend
npm install
npm run dev
```

App available at: http://localhost:5173

---

## API Endpoints

| Method | Endpoint                        | Description                        |
|--------|---------------------------------|------------------------------------|
| GET    | /api/articles                   | List articles (with filters)       |
| POST   | /api/articles                   | Create a new article               |
| GET    | /api/articles/{id}              | Get article details                |
| PUT    | /api/articles/{id}              | Update article                     |
| DELETE | /api/articles/{id}              | Delete article                     |
| POST   | /api/articles/{id}/approve      | Approve an article                 |
| POST   | /api/articles/{id}/reject       | Reject with reason                 |
| POST   | /api/articles/{id}/rate         | Rate an article                    |
| GET    | /api/categories                 | List all categories                |
| POST   | /api/categories                 | Create a category                  |

---

## Phase 2 — ETL Pipeline

Phase 2 extends the system with a Python/Pandas ETL pipeline for article indexing and usage analytics reporting.

### ETL Workflow

```
datasets/articles_dataset.csv
        │
        ▼ EXTRACT (pandas.read_csv)
        │
        ▼ TRANSFORM
        │  • Strip/normalize text fields
        │  • Lowercase and standardize tags
        │  • Validate view_count and rating (numeric coerce)
        │  • Remove duplicate titles
        │  • Filter out empty titles
        │
        ▼ LOAD (SQLite analytics tables)
        │  • article_analytics       — individual cleaned records
        │  • kb_category_analytics   — category view/rating aggregates
        │  • author_analytics        — author activity reports
        │  • top_articles            — top 10 most-viewed articles
```

### Running the ETL

**Via API:**
```bash
curl -X POST http://localhost:8000/api/analytics/etl/run
```

**Via Dashboard UI:**  
Open the app → scroll to "ETL Analytics Pipeline" section → click "Run ETL".

### ETL Analytics Endpoints

| Method | Endpoint                       | Description                          |
|--------|--------------------------------|--------------------------------------|
| POST   | /api/analytics/etl/run         | Trigger the ETL pipeline             |
| GET    | /api/analytics/etl/status      | Check if ETL data is loaded          |
| GET    | /api/analytics/summary         | Total records, total views, avg rating|
| GET    | /api/analytics/categories      | Category usage and view analytics    |
| GET    | /api/analytics/authors         | Author activity reports              |
| GET    | /api/analytics/top-articles    | Top 10 most-viewed articles          |

### Dataset

`datasets/articles_dataset.csv` — 120 sample KB article records covering 6 categories, 10 authors, with view counts 10–500 and dates from Sep 2024 – Apr 2025.

---

## Project Structure

```
EKBMS/
├── datasets/
│   └── articles_dataset.csv      # ETL input dataset (120 records)
├── backend/
│   ├── main.py                   # FastAPI app entry point
│   ├── database.py               # SQLAlchemy engine & session
│   ├── models.py                 # ORM models (Phase 1)
│   ├── analytics_models.py       # ETL analytics models (Phase 2)
│   ├── etl.py                    # ETL pipeline (Phase 2)
│   ├── schemas.py                # Pydantic schemas
│   ├── crud.py                   # Database operations
│   ├── routers/
│   │   ├── articles.py           # Article routes
│   │   ├── categories.py         # Category routes
│   │   └── analytics.py         # ETL analytics routes (Phase 2)
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── services/api.js       # Axios API calls (incl. ETL)
│       └── pages/
│           ├── Dashboard.jsx     # Dashboard + ETL analytics section
│           ├── ArticleList.jsx
│           └── CreateArticle.jsx
└── README.md
```
