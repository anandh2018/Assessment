# Customer Complaint & Resolution Tracking System (CCRTS)

A full-stack complaint management platform built with FastAPI (Python) and React (Vite), with SQLite for persistent storage.

## Features

- Register, view, update, and delete customer complaints
- Filter complaints by status, category, and priority
- Dashboard with live stats (Total, Open, In Progress, Escalated, Resolved)
- Status history audit trail for every complaint
- Agent assignment and resolution notes
- Complaint number auto-generation (COMP-XXXXXX)

## Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Frontend  | React 18, React Router v6, Axios, Vite    |
| Backend   | Python 3.10+, FastAPI, Uvicorn            |
| Database  | SQLite (via SQLAlchemy 2.0)               |
| Styling   | Pure CSS / Inline styles                  |

---

## Setup & Running

### Backend

```bash
cd CCRTS/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API available at: http://localhost:8000  
Interactive docs: http://localhost:8000/docs

### Frontend

```bash
cd CCRTS/frontend
npm install
npm run dev
```

App available at: http://localhost:5173

---

## API Endpoints

| Method | Endpoint                        | Description                        |
|--------|---------------------------------|------------------------------------|
| GET    | /api/dashboard/stats            | Dashboard statistics               |
| GET    | /api/complaints                 | List all complaints (with filters) |
| POST   | /api/complaints                 | Register a new complaint           |
| GET    | /api/complaints/{id}            | Get complaint details              |
| PUT    | /api/complaints/{id}            | Update complaint status/notes      |
| DELETE | /api/complaints/{id}            | Delete a complaint                 |
| GET    | /api/complaints/{id}/history    | Get status change history          |

---

## Phase 2 — ETL Pipeline

Phase 2 extends the system with a Python/Pandas ETL pipeline for SLA analysis and agent performance reporting.

### ETL Workflow

```
datasets/complaints_dataset.csv
        │
        ▼ EXTRACT (pandas.read_csv)
        │
        ▼ TRANSFORM
        │  • Normalize priority/status/category text fields
        │  • Fill missing assigned_to with "Unassigned"
        │  • Compute sla_breached = (Resolved/Closed) AND
        │    (resolution_time_hours > sla_hours)
        │  • Remove duplicate complaint numbers
        │
        ▼ LOAD (SQLite analytics tables)
        │  • complaint_analytics  — individual cleaned records
        │  • category_summary     — per-category aggregates + SLA
        │  • agent_performance    — per-agent resolution stats
        │  • priority_summary     — priority distribution + breach rate
```

### Running the ETL

**Via API:**
```bash
curl -X POST http://localhost:8000/api/analytics/etl/run
```

**Via Dashboard UI:**  
Open the app → scroll to "ETL Analytics Pipeline" section → click "Run ETL Pipeline".

### ETL Analytics Endpoints

| Method | Endpoint                       | Description                          |
|--------|--------------------------------|--------------------------------------|
| POST   | /api/analytics/etl/run         | Trigger the ETL pipeline             |
| GET    | /api/analytics/etl/status      | Check if ETL data is loaded          |
| GET    | /api/analytics/summary         | Total records, SLA breach count/rate |
| GET    | /api/analytics/categories      | Category-wise complaint analysis     |
| GET    | /api/analytics/agents          | Agent performance report             |
| GET    | /api/analytics/priorities      | Priority distribution + breach rate  |
| GET    | /api/analytics/sla-breaches    | List of all SLA-breached complaints  |

### Dataset

`datasets/complaints_dataset.csv` — 200 sample complaint records covering 7 categories, 4 priority levels, and 6 agents with dates from Nov 2024 – Apr 2025.

---

## Project Structure

```
CCRTS/
├── datasets/
│   └── complaints_dataset.csv    # ETL input dataset (200 records)
├── backend/
│   ├── main.py                   # FastAPI app entry point
│   ├── database.py               # SQLAlchemy engine & session
│   ├── models.py                 # ORM models (Phase 1)
│   ├── analytics_models.py       # ETL analytics models (Phase 2)
│   ├── etl.py                    # ETL pipeline (Phase 2)
│   ├── schemas.py                # Pydantic schemas
│   ├── crud.py                   # Database operations
│   ├── routers/
│   │   ├── complaints.py         # Complaint routes
│   │   └── analytics.py         # ETL analytics routes (Phase 2)
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── services/api.js       # Axios API calls (incl. ETL)
│       └── pages/
│           ├── Dashboard.jsx     # Dashboard + ETL analytics section
│           ├── ComplaintList.jsx
│           ├── ComplaintDetail.jsx
│           └── RegisterComplaint.jsx
└── README.md
```
