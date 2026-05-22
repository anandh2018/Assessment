# Helpdesk Ticket Management System (HDMS)

A full-stack IT helpdesk ticketing application built with React (Vite) on the frontend and Python FastAPI on the backend, with SQLite for persistent storage.

---

## Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Frontend  | React 18, React Router v6, Axios, Vite 5  |
| Backend   | Python 3.10+, FastAPI 0.104, Uvicorn      |
| Database  | SQLite (via SQLAlchemy 2.0)               |
| Styling   | Pure CSS / Inline styles (no frameworks) |

---

## Features

- Create, view, update, and delete IT support tickets
- Filter and search tickets by keyword, status, category, and priority
- Dashboard with live stats (Total, Open, In Progress, Resolved/Closed)
- Color-coded priority and status badges
- Ticket detail page with inline status update and resolution notes
- Fully responsive layout

---

## Project Structure

```
HDMS/
├── backend/
│   ├── main.py             # FastAPI app entry point
│   ├── database.py         # SQLAlchemy engine & session
│   ├── models.py           # ORM models
│   ├── schemas.py          # Pydantic schemas
│   ├── crud.py             # Database operations
│   ├── routers/
│   │   └── tickets.py      # API route handlers
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── TicketCard.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateTicket.jsx
│   │   │   ├── TicketList.jsx
│   │   │   └── TicketDetail.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- npm 9 or higher

---

### Backend Setup

```bash
# Navigate to the backend folder
cd HDMS/backend

# (Optional) Create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn main:app --reload
```

The backend will be available at: **http://localhost:8000**

Interactive API docs: **http://localhost:8000/docs**

---

### Frontend Setup

Open a second terminal:

```bash
# Navigate to the frontend folder
cd HDMS/frontend

# Install npm dependencies
npm install

# Start the Vite dev server
npm run dev
```

The frontend will be available at: **http://localhost:5173**

The Vite proxy forwards all `/api` requests to `http://localhost:8000`, so no CORS issues in development.

---

## API Endpoints

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | /                         | App info                             |
| GET    | /health                   | Health check                         |
| GET    | /api/tickets              | List all tickets (supports filters)  |
| POST   | /api/tickets              | Create a new ticket                  |
| GET    | /api/tickets/{id}         | Get ticket by ID                     |
| PUT    | /api/tickets/{id}         | Update ticket                        |
| DELETE | /api/tickets/{id}         | Delete ticket                        |
| GET    | /api/search               | Search tickets by keyword/filters    |

### Query Parameters for GET /api/tickets

| Param      | Values                                                                 |
|------------|------------------------------------------------------------------------|
| `status`   | Open, In Progress, Resolved, Closed                                    |
| `category` | VPN Issue, Password Reset, Software Installation, Laptop Issue, etc.   |
| `priority` | Low, Medium, High, Critical                                            |
| `skip`     | integer (pagination offset)                                            |
| `limit`    | integer (max results)                                                  |

### Query Parameters for GET /api/search

| Param      | Description                    |
|------------|--------------------------------|
| `keyword`  | Search in name/dept/description|
| `status`   | Filter by status               |
| `category` | Filter by category             |
| `priority` | Filter by priority             |

---

## Ticket Fields

| Field            | Type     | Required | Notes                                   |
|------------------|----------|----------|-----------------------------------------|
| employee_name    | string   | Yes      | Name of the employee                    |
| department       | string   | Yes      | Department of the employee              |
| issue_category   | string   | Yes      | One of 7 predefined categories          |
| description      | string   | Yes      | Minimum 10 characters                   |
| priority         | string   | Yes      | Low / Medium / High / Critical          |
| status           | string   | Auto     | Defaults to "Open"                      |
| resolution_notes | string   | No       | Added when resolving                    |
| created_at       | datetime | Auto     | Set on creation                         |

---

## Phase 2 — ETL Pipeline

Phase 2 extends the system with a Python/Pandas ETL pipeline for historical ticket analysis and support metrics reporting.

### ETL Workflow

```
datasets/tickets_dataset.csv
        │
        ▼ EXTRACT (pandas.read_csv)
        │
        ▼ TRANSFORM
        │  • Strip/normalize text fields (title-case priority)
        │  • Convert resolution_time_hours to numeric
        │  • Remove duplicate entries (employee + category + date)
        │
        ▼ LOAD (SQLite analytics tables)
        │  • ticket_analytics           — individual cleaned records
        │  • ticket_category_analytics  — per-category aggregates
        │  • department_analytics       — per-department ticket counts
        │  • ticket_priority_analytics  — priority distribution
```

### Running the ETL

**Via API:**
```bash
curl -X POST http://localhost:8000/api/analytics/etl/run
```

**Via Dashboard UI:**  
Open the app → scroll to "ETL Analytics Pipeline" section → click "Run ETL".

### ETL Analytics Endpoints

| Method | Endpoint                       | Description                         |
|--------|--------------------------------|-------------------------------------|
| POST   | /api/analytics/etl/run         | Trigger the ETL pipeline            |
| GET    | /api/analytics/etl/status      | Check if ETL data is loaded         |
| GET    | /api/analytics/summary         | Total records, resolved, avg hours  |
| GET    | /api/analytics/categories      | Issue category breakdown            |
| GET    | /api/analytics/departments     | Department-wise ticket counts       |
| GET    | /api/analytics/priorities      | Priority distribution               |

### Dataset

`datasets/tickets_dataset.csv` — 212 sample records covering 12 issue categories, 10 departments, and 25 employees with dates from Oct 2024 – Apr 2025.

### Updated Project Structure (Phase 2)

```
HDMS/
├── datasets/
│   └── tickets_dataset.csv        # ETL input dataset (212 records)
├── backend/
│   ├── analytics_models.py        # ETL analytics models (Phase 2)
│   ├── etl.py                     # ETL pipeline (Phase 2)
│   ├── routers/
│   │   ├── tickets.py
│   │   └── analytics.py           # ETL analytics routes (Phase 2)
│   └── ...
└── ...
```

---

## Screenshots

_(Screenshots to be added after running the application)_

- Dashboard view with ETL analytics section
- Ticket list with filters
- Create ticket form
- Ticket detail / update view
