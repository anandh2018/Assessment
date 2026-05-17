# Customer Complaint & Resolution Tracking System (CCRS)

## Overview

The Customer Complaint & Resolution Tracking System (CCRS) is a full-stack web application that enables organizations to efficiently manage, track, and resolve customer complaints. It provides comprehensive dashboards, complaint management features, and analytics for better customer service management.

## Key Features

### Complaint Management
- Submit and manage customer complaints with detailed information
- Assign complaints to support agents
- Track complaint status (Open, In Progress, On Hold, Escalated, Resolved, Closed)
- Set priority levels (Low, Medium, High, Critical)
- Categorize complaints for better organization
- Comprehensive complaint history and audit trail
- Escalation workflow for complex issues

### Dashboard & Analytics
- Real-time statistics on complaint status distribution
- Average resolution time tracking
- SLA breach monitoring (72-hour threshold)
- Visual dashboard with key metrics
- Recent complaints overview

### User Management
- Multiple user roles: Admin, Agent, Supervisor, Customer
- Role-based access control
- User profile management

### Feedback System
- Collect customer feedback on resolved complaints
- 1-5 star rating system
- Detailed feedback comments

### Advanced Features
- Search and filter complaints by multiple criteria
- Pagination support for large datasets
- Complaint history tracking with timestamps
- File attachment support for evidence
- Responsive UI design

## Tech Stack

| Layer    | Technology                         |
|----------|------------------------------------|
| Backend  | Python 3, FastAPI, SQLAlchemy ORM  |
| Database | SQLite                             |
| Frontend | React 18, Vite, Axios              |
| HTTP     | RESTful API                        |

---

## Project Structure

```
CCRS/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # SQLAlchemy setup and session
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic validation schemas
│   ├── crud.py              # Database operations (CRUD)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── complaints.py    # Complaint API endpoints
│   │   └── dashboard.py     # Dashboard and utility endpoints
│   ├── requirements.txt     # Python dependencies
│   └── complaints.db        # SQLite database (auto-generated)
├── frontend/
│   ├── src/
│   │   ├── main.jsx         # React entry point
│   │   ├── App.jsx          # Root component with navigation
│   │   ├── App.css          # Main styles
│   │   ├── index.css        # Global styles
│   │   ├── api.js           # Axios API client
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Dashboard.css
│   │   │   ├── ComplaintForm.jsx
│   │   │   ├── ComplaintForm.css
│   │   │   ├── ComplaintList.jsx
│   │   │   ├── ComplaintList.css
│   │   │   ├── ComplaintDetails.jsx
│   │   │   └── ComplaintDetails.css
│   │   ├── components/
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── StatusBadge.css
│   │   │   ├── PriorityBadge.jsx
│   │   │   └── PriorityBadge.css
│   │   └── assets/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── node_modules/       (auto-generated)
├── database/
│   ├── schema.sql          # Database schema definition
│   └── sample_data.sql     # Sample data for testing
├── README.md               # This file
└── .gitignore

```

---

## Prerequisites

### Backend
- Python 3.8+
- pip3

### Frontend
- Node.js 18+
- npm

---

## Backend Setup

### 1. Install Python Dependencies

```bash
cd backend
pip3 install -r requirements.txt
```

### 2. Run the Backend Server

```bash
cd backend
python3 main.py
```

Or use Uvicorn directly:
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

The backend API will be available at: **http://localhost:8002**

Interactive API documentation: **http://localhost:8002/docs**

---

## Frontend Setup

### 1. Install Node Dependencies

```bash
cd frontend
npm install
```

### 2. Run the Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at: **http://localhost:5175** (or **http://localhost:5174** if port is in use)

### Build for Production

```bash
cd frontend
npm run build
```

---

## Database Setup

The SQLite database is automatically created when the backend starts. To populate it with sample data:

```bash
# From the backend directory
sqlite3 complaints.db < ../database/schema.sql
sqlite3 complaints.db < ../database/sample_data.sql
```

Or manually execute the SQL files through your SQLite client.

---

## API Endpoints

### Health & Info
| Method | Path      | Description           |
|--------|-----------|------------------------|
| GET    | /         | API info and version  |
| GET    | /health   | Health check endpoint |

### Dashboard
| Method | Path           | Description                 |
|--------|----------------|-----------------------------|
| GET    | /api/dashboard | Dashboard statistics        |

### Complaints (CRUD)
| Method | Path                              | Description                          |
|--------|-----------------------------------|--------------------------------------|
| GET    | /complaints                       | List all complaints                  |
| GET    | /complaints/{complaint_id}        | Get a specific complaint             |
| GET    | /complaints/customer/{customer_id}| Get complaints for a customer        |
| GET    | /complaints/{id}/history          | Get complaint history/audit trail    |
| POST   | /complaints                       | Create new complaint                 |
| PUT    | /complaints/{complaint_id}        | Update a complaint                   |
| PUT    | /complaints/{id}/assign           | Assign complaint to agent            |
| PUT    | /complaints/{id}/escalate         | Escalate complaint to supervisor     |
| DELETE | /complaints/{complaint_id}        | Close complaint (soft delete)         |

### Users
| Method | Path              | Description        |
|--------|-------------------|--------------------|
| GET    | /api/users        | List all users     |
| GET    | /api/users/{id}   | Get specific user  |
| POST   | /api/users        | Create new user    |
| PUT    | /api/users/{id}   | Update user        |

### Categories
| Method | Path                | Description           |
|--------|---------------------|-----------------------|
| GET    | /api/categories     | List all categories   |
| GET    | /api/categories/{id}| Get specific category |
| POST   | /api/categories     | Create new category   |

### Feedback
| Method | Path                     | Description                 |
|--------|--------------------------|-----------------------------| 
| POST   | /api/feedback            | Submit feedback              |
| GET    | /api/feedback/{complaint_id} | Get feedback for complaint   |

### Query Parameters for GET /complaints

| Param        | Type    | Description                          |
|--------------|---------|--------------------------------------|
| search       | string  | Keyword search in title & description|
| status       | string  | Filter by status (open, in_progress, etc.)|
| priority     | string  | Filter by priority (low, medium, high, critical)|
| category_id  | integer | Filter by complaint category         |
| assigned_to  | integer | Filter by assigned agent             |
| skip         | integer | Pagination offset (default 0)        |
| limit        | integer | Records per page (default 100, max 500)|

---

## Complaint Statuses

- **Open**: Newly created complaint, not yet assigned
- **In Progress**: Complaint assigned to an agent being worked on
- **On Hold**: Complaint temporarily paused, waiting for customer response or information
- **Escalated**: Complex complaint escalated to supervisor
- **Resolved**: Issue resolved and awaiting customer confirmation
- **Closed**: Complaint formally closed

## Priority Levels

- **Low**: Non-urgent issues, general inquiries
- **Medium**: Standard issues requiring resolution
- **High**: Serious issues affecting multiple customers or operations
- **Critical**: Severe issues requiring immediate attention

---

## User Roles

- **Admin**: Full system access, user management
- **Agent**: Handle complaints, update status, assign to other agents
- **Supervisor**: Review escalated complaints, oversight
- **Customer**: Submit complaints, provide feedback

---

## Sample Data

The `database/sample_data.sql` file includes:
- 9 sample users (mix of staff and customers)
- 7 complaint categories
- 9 sample complaints with various statuses
- 16 history records showing complaint lifecycle
- 3 feedback entries

Load this data to quickly test the system:

```bash
sqlite3 complaints.db < database/sample_data.sql
```

---

## How to Run the Complete System

### Terminal 1 - Backend
```bash
cd "/path/to/CCRS/backend"
pip3 install -r requirements.txt
python3 main.py
# Backend runs on port 8002
```

### Terminal 2 - Frontend
```bash
cd "/path/to/CCRS/frontend"
npm install
npm run dev
# Frontend runs on port 5175
```

### Open in Browser
Navigate to: **http://localhost:5175**

---

## Common Workflows

### Creating a Complaint
1. Click "Report Complaint" in navigation
2. Fill in title, description, category, and priority
3. Submit the form
4. Complaint is created with "Open" status

### Assigning a Complaint (Agent)
1. View complaint in dashboard or list
2. Click "Assign" button
3. Select agent from dropdown
4. Complaint status changes to "In Progress"

### Escalating a Complaint (Agent/Supervisor)
1. Open the complaint
2. Click "Escalate" button
3. Select supervisor
4. Complaint status changes to "Escalated"

### Resolving a Complaint
1. Open complaint and update description/notes
2. Change status to "Resolved"
3. Save changes
4. Customer can then provide feedback

---

## Performance & Scalability

- Database queries are optimized with indexes
- Pagination prevents loading excessive data
- SLA breach calculation uses efficient queries
- Frontend uses lazy loading for better UX
- API responses are fast and structured

---

## Error Handling

- Comprehensive validation on both frontend and backend
- Meaningful error messages for users
- Proper HTTP status codes (400, 404, 500, etc.)
- Form validation before submission
- Database transaction handling

---

## Security Considerations

- Input validation using Pydantic schemas
- SQL injection prevention via SQLAlchemy ORM
- CORS enabled for development (configure for production)
- Email format validation
- Role-based endpoint access (future enhancement)

---

## Future Enhancements

- Email notifications for complaint updates
- Advanced reporting and analytics
- File attachments with virus scanning
- Real-time updates via WebSocket
- Integration with external ticketing systems
- Mobile app
- Multi-language support
- Advanced search with filters
- SLA policies by category

---

## Troubleshooting

### Backend Port Already in Use
```bash
# Change port in main.py or use:
uvicorn main:app --port 8003
```

### Frontend Port Already in Use
```bash
# Change port in vite.config.js or use:
npm run dev -- --port 5176
```

### Database Issues
```bash
# Reset database (delete and recreate)
rm backend/complaints.db
python3 backend/main.py  # Creates new database
```

### CORS Issues
Ensure backend runs on port 8002 and frontend on 5175, or update CORS settings in `main.py`

---

## Support & Contact

For issues or questions, refer to the API documentation at `/docs` endpoint or check the application logs.

---

## License

This project is provided as-is for educational and commercial use.

---

## Version History

- **v1.0.0** (2025-05-17): Initial release with core features
  - Complaint management (CRUD)
  - User roles and management
  - Dashboard with analytics
  - Feedback system
  - Comprehensive audit trail
