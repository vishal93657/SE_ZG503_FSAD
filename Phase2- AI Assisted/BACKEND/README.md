# School Equipment Lending Portal API

This is a robust backend API built with FastAPI and using postgresql database to manage a school's equipment inventory and handle student/staff loan requests. It includes user authentication (signup/login), inventory CRUD operations, and a workflow for managing loan request statuses.

✨ **Features**

- **User Management**: Secure signup and login with JWT authentication.
- **Inventory Tracking**: CRUD operations for equipment, including automated tracking of available quantity.
- **Loan Workflow**: Students can create loan requests, and staff/admins can accept, reject, or mark requests as returned.
- **Password Security**: Passwords are securely hashed using Bcrypt.
- **Database**: Uses SQLAlchemy ORM for database interactions.

⚙️ **Local Setup**

### Prerequisites

Ensure the following are installed on your system:

- Python 3.9+
- `pip` (Python package installer)
- PostgreSQL Database (or modify the connection string in `database.py`)

### 1. Installation

Clone the repository (if applicable) and install the required Python packages:

```bash
In project root directory
pip install -r requirements.txt
```

### 2. Database Configuration
```bash
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/school_lending")
```

### 3. Running the Application
```bash
uvicorn main:app --reload
You can view the interactive swagger documentation at http://127.0.0.1:8000/docs
```

###  🧭 API Endpoints Overview
#### Authentication & Users
| Method | Endpoint | Description |
|:-----|:---:|:-----|
| POST | /signup | Registers a new user|
| POST | /login | Authenticates a user and returns a JWT access token|
| GET | /profile/{username}| Retrieves the authenticated user's profile|
| POST | /logout | Placeholder for client-side token deletion|

#### Equipment
| Method | Endpoint | Description |
|:-----|:---:|:-----|
| POST | /equipment | Staff/Admin: Creates a new equipment item|
| GET | /equipment | Public: Retrieves a list of all equipment with available stock|
| PATCH | /equipment/{id}| Staff/Admin: Updates equipment details (name, quantity, etc.)|
| DELETE | /equipment/{id} | Placeholder for client-side token deletion.

#### Loan Requests
| Method | Endpoint | Description |
|:-----|:---:|:-----|
| POST | /borrow/{equipment_id} |User: Creates a new loan request for an equipment item.|
| GET | /loan_requests |Staff/Admin: Retrieves a list of all loan requests|
| PATCH | /loan_requests/{id}|Staff/Admin: Updates loan status (accepted, returned, rejected).
