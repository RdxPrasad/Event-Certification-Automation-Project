from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.models import User, Event, Registration, Certificate
from app.routers import user, event, registration, certificate

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Event & Certificate Automation System",
    description="Backend API for managing events, user registrations, and automated certificate generation.",
    version="1.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(user.router)
app.include_router(event.router)
app.include_router(registration.router)
app.include_router(certificate.router)


@app.get("/", tags=["Root"])
def root():
    return {"message": "Event & Certification Automation Backend Running 🎉"}