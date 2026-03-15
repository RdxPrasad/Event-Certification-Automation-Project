# 🎓 Event & Certificate Automation System

A full-stack application for managing events, user registrations, and automated PDF certificate generation — built with **FastAPI** (backend) and a premium **vanilla JS** dark-mode frontend.

---

## ✨ Features

- **User Authentication** — Register, login with JWT tokens, role-based access control
- **Event Management** — Full CRUD for events (create, read, update, delete)
- **Event Registration** — Students can register for events with duplicate prevention
- **Certificate Generation** — Auto-generate PDF certificates for all event participants
- **Attendance Upload** — CSV/PDF attendance file upload from the admin panel
- **Email Simulation** — Certificate delivery via email (simulated in frontend)
- **Role-Based Access** — `student` and `organizer` roles with proper authorization
- **Premium Dark UI** — Glassmorphism design with particle animations and smooth transitions
- **Swagger UI** — Interactive API documentation at `/docs`

---

## 🛠️ Tech Stack

### Backend
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

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5** | Semantic page structure |
| **Vanilla CSS** | Premium dark-mode glassmorphism design |
| **Vanilla JavaScript** | Auth, dashboard, admin logic |
| **Canvas API** | Particle animation background |
| **LocalStorage** | Client-side data persistence |
| **Google Fonts (Inter)** | Modern typography |

---

## 📁 Project Structure

```
.
├── app/                          # ── Backend (FastAPI) ──
│   ├── main.py                   # App entry point, CORS, router wiring
│   ├── database.py               # MySQL connection & session
│   ├── core/
│   │   └── security.py           # JWT auth & password hashing
│   ├── models/
│   │   ├── user.py               # User table
│   │   ├── event.py              # Event table
│   │   ├── registration.py       # Registration table
│   │   └── certificate.py        # Certificate table
│   ├── schemas/
│   │   ├── user.py               # User request/response schemas
│   │   ├── event.py              # Event schemas
│   │   ├── registration.py       # Registration schemas
│   │   └── certificate.py        # Certificate schemas
│   ├── routers/
│   │   ├── user.py               # /users endpoints
│   │   ├── event.py              # /events endpoints
│   │   ├── registration.py       # /registrations endpoints
│   │   └── certificate.py        # /certificates endpoints
│   └── services/
│       └── certificate_service.py # PDF generation logic
│
├── frontend/                     # ── Frontend (Vanilla JS) ──
│   ├── index.html                # Landing page + Login/Register
│   ├── dashboard.html            # Student dashboard
│   ├── admin.html                # Admin/Organizer panel
│   ├── css/
│   │   └── styles.css            # Premium dark-mode design system
│   └── js/
│       ├── app.js                # Core auth, toasts, particles, mock data
│       ├── dashboard.js          # Student view logic
│       └── admin.js              # Admin panel logic
│
├── certificates/                 # Generated PDF certificates
├── .env                          # Environment variables
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

### 6. Run the backend server
```bash
uvicorn app.main:app --reload
```
📖 API docs at: **http://127.0.0.1:8000/docs**

### 7. Open the frontend
Open `frontend/index.html` directly in your browser, or serve it with:
```bash
cd frontend
python -m http.server 5500
```
Then visit: **http://localhost:5500**

---

## 📡 API Endpoints

### 👤 Users (`/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:---:|
| `POST` | `/users/register` | Register a new user | ❌ |
| `POST` | `/users/login` | Login & get JWT token | ❌ |
| `GET` | `/users/me` | Get current user profile | ✅ |

### 📅 Events (`/events`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:---:|
| `POST` | `/events/` | Create a new event | ✅ Organizer |
| `GET` | `/events/` | List all events | ❌ |
| `GET` | `/events/{id}` | Get event details | ❌ |
| `PUT` | `/events/{id}` | Update an event | ✅ Owner |
| `DELETE` | `/events/{id}` | Delete an event | ✅ Owner |

### 📝 Registrations (`/registrations`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:---:|
| `POST` | `/registrations/` | Register for an event | ✅ |
| `GET` | `/registrations/` | List my registrations | ✅ |
| `GET` | `/registrations/event/{id}` | List event registrations | ✅ Organizer |

### 🏆 Certificates (`/certificates`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:---:|
| `POST` | `/certificates/generate/{event_id}` | Generate certificates for all participants | ✅ Organizer |
| `GET` | `/certificates/` | List my certificates | ✅ |
| `GET` | `/certificates/download/{id}` | Download certificate PDF | ❌ |

---

## 🖥️ Frontend Pages

| Page | File | Description |
|------|------|-------------|
| **Landing** | `index.html` | Hero section with login/register forms and particle animation |
| **Student Dashboard** | `dashboard.html` | Overview stats, upcoming/current events, registrations, certificates |
| **Admin Panel** | `admin.html` | Event CRUD, attendance upload (CSV/PDF), certificate generation, email sending |

---

## 👥 User Roles

| Role | Permissions |
|------|------------|
| **student** (default) | Register for events, view & download certificates |
| **organizer** | All student permissions + create/manage events, upload attendance, generate certificates, send emails |

---

## 🔐 Authentication Flow

1. **Register** → `POST /users/register` with name, email, password, and role
2. **Login** → `POST /users/login` to receive a JWT access token
3. **Use Token** → Include `Authorization: Bearer <token>` header in protected requests
4. In Swagger UI, click **"Authorize"** button and paste your token

---

## 👨‍💻 Contributors

- **Backend** — FastAPI REST API, database models, JWT auth, PDF certificate generation
- **Frontend** — Premium dark-mode UI with glassmorphism, dashboard, admin panel

---

## 📄 License

This project is built for educational purposes as part of the TIC (Technical Innovation Club) initiative.