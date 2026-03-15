from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.event import Event
from app.models.registration import Registration
from app.schemas.registration import RegistrationCreate, RegistrationResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/registrations", tags=["Registrations"])


@router.post("/", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_for_event(
    reg_data: RegistrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Register the current user for an event."""
    # Check event exists
    event = db.query(Event).filter(Event.id == reg_data.event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # Check if already registered
    existing = (
        db.query(Registration)
        .filter(
            Registration.user_id == current_user.id,
            Registration.event_id == reg_data.event_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already registered for this event",
        )

    registration = Registration(
        user_id=current_user.id,
        event_id=reg_data.event_id,
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration


@router.get("/", response_model=List[RegistrationResponse])
def list_my_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all registrations for the current user."""
    registrations = (
        db.query(Registration)
        .filter(Registration.user_id == current_user.id)
        .all()
    )
    return registrations


@router.get("/event/{event_id}", response_model=List[RegistrationResponse])
def list_event_registrations(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all registrations for a specific event. Only the event organizer can view."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    if event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the event organizer can view registrations",
        )

    registrations = (
        db.query(Registration)
        .filter(Registration.event_id == event_id)
        .all()
    )
    return registrations
