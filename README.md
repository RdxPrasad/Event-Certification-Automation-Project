# 🎓 Event & Certificate Automation System

A full-featured **FastAPI** backend for managing events, user registrations, and automated PDF certificate generation.

---

## ✨ Features

- **User Authentication** — Register, login with JWT tokens, role-based access control
- **Event Management** — Full CRUD for events (create, read, update, delete)
- **Event Registration** — Students can register for events with duplicate prevention
- **Certificate Generation** — Auto-generate PDF certificates for all event participants
- **Role-Based Access** — `student` and `organizer` roles with proper authorization
- **Swagger UI** — Interactive API documentation at `/docs`

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **FastAPI** | REST API framework |
| **SQLAlchemy** | ORM for MySQL |
| **PyMySQL** | MySQL database driver |
| **python-jose** | JWT authentication |
| **Passlib + Bcrypt** | Password hashing |
| **ReportLab** | PDF certificate generation |
| **Pydantic** | Data validation & serialization |
| **Uvicorn** | ASGI server |

---

## 📁 Project Structure

```
Event & Certificate Automation System/
├── app/
│   ├── main.py                  # FastAPI app entry point
│   ├── database.py              # DB connection & session
│   ├── core/
│   │   └── security.py          # JWT auth & password hashing
│   ├── models/
│   │   ├── user.py              # User table
│   │   ├── event.py             # Event table
│   │   ├── registration.py      # Registration table
│   │   └── certificate.py       # Certificate table
│   ├── schemas/
│   │   ├── user.py              # User request/response schemas
│   │   ├── event.py             # Event request/response schemas
│   │   ├── registration.py      # Registration schemas
│   │   └── certificate.py       # Certificate schemas
│   ├── routers/
│   │   ├── user.py              # /users endpoints
│   │   ├── event.py             # /events endpoints
│   │   ├── registration.py      # /registrations endpoints
│   │   └── certificate.py       # /certificates endpoints
│   └── services/
│       └── certificate_service.py  # PDF generation logic
├── certificates/                # Generated PDF certificates
├── .env                         # Environment variables
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 🚀 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/RdxPrasad/Event-Certification-Automation-Project.git
cd Event-Certification-Automation-Project
```

### 2. Create & activate virtual environment
```bash
python -m venv MyVenv

# Windows
MyVenv\Scripts\activate

# macOS/Linux
source MyVenv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment variables
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=event_certificate_db

# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 5. Create MySQL database
```sql
CREATE DATABASE event_certificate_db;
```

### 6. Run the server
```bash
uvicorn app.main:app --reload
```

📖 Open **http://127.0.0.1:8000/docs** for interactive Swagger documentation.

---

## 📡 API Endpoints

### 👤 Users (`/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/users/register` | Register a new user | ❌ |
| `POST` | `/users/login` | Login & get JWT token | ❌ |
| `GET` | `/users/me` | Get current user profile | ✅ |

### 📅 Events (`/events`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/events/` | Create a new event | ✅ Organizer |
| `GET` | `/events/` | List all events | ❌ |
| `GET` | `/events/{id}` | Get event details | ❌ |
| `PUT` | `/events/{id}` | Update an event | ✅ Owner |
| `DELETE` | `/events/{id}` | Delete an event | ✅ Owner |

### 📝 Registrations (`/registrations`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/registrations/` | Register for an event | ✅ |
| `GET` | `/registrations/` | List my registrations | ✅ |
| `GET` | `/registrations/event/{id}` | List event registrations | ✅ Organizer |

### 🏆 Certificates (`/certificates`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/certificates/generate/{event_id}` | Generate certificates for all participants | ✅ Organizer |
| `GET` | `/certificates/` | List my certificates | ✅ |
| `GET` | `/certificates/download/{id}` | Download certificate PDF | ❌ |

---

## 👥 User Roles

| Role | Permissions |
|------|------------|
| **student** (default) | Register for events, view & download certificates |
| **organizer** | All student permissions + create/manage events, generate certificates |

---

## 🔐 Authentication Flow

1. **Register** → `POST /users/register` with name, email, password, and role
2. **Login** → `POST /users/login` to receive a JWT access token
3. **Use Token** → Include `Authorization: Bearer <token>` header in protected requests
4. In Swagger UI, click **"Authorize"** button and paste your token

---

## 📄 License

This project is built for educational purposes as part of the TIC (Technical Innovation Club) initiative.