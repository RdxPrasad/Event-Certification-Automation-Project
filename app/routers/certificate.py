from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.event import Event
from app.models.registration import Registration
from app.models.certificate import Certificate
from app.schemas.certificate import CertificateResponse
from app.core.security import get_current_user
from app.services.certificate_service import generate_certificate

router = APIRouter(prefix="/certificates", tags=["Certificates"])


@router.post("/generate/{event_id}", response_model=List[CertificateResponse])
def generate_certificates_for_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate certificates for ALL registered users of an event.
    Only the event organizer can do this.
    """
    # Verify event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # Only organizer of this event can generate certificates
    if event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the event organizer can generate certificates",
        )

    # Get all registrations for this event
    registrations = db.query(Registration).filter(Registration.event_id == event_id).all()
    if not registrations:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No registrations found for this event",
        )

    generated_certificates = []

    for registration in registrations:
        # Skip if certificate already exists
        existing_cert = (
            db.query(Certificate)
            .filter(
                Certificate.user_id == registration.user_id,
                Certificate.event_id == event_id,
            )
            .first()
        )
        if existing_cert:
            generated_certificates.append(existing_cert)
            continue

        # Create certificate DB record first to get the ID
        cert = Certificate(
            user_id=registration.user_id,
            event_id=event_id,
            certificate_url="",  # will update after generation
        )
        db.add(cert)
        db.flush()  # get the ID without committing

        # Get user name
        user = db.query(User).filter(User.id == registration.user_id).first()

        # Generate the PDF
        filepath = generate_certificate(
            user_name=user.full_name,
            event_title=event.title,
            event_date=event.date,
            cert_id=cert.id,
        )

        # Update the certificate URL
        cert.certificate_url = f"/certificates/download/{cert.id}"
        generated_certificates.append(cert)

    db.commit()
    for cert in generated_certificates:
        db.refresh(cert)

    return generated_certificates


@router.get("/", response_model=List[CertificateResponse])
def list_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all certificates for the current user."""
    certificates = (
        db.query(Certificate)
        .filter(Certificate.user_id == current_user.id)
        .all()
    )
    return certificates


@router.get("/download/{certificate_id}")
def download_certificate(
    certificate_id: int,
    db: Session = Depends(get_db),
):
    """Download a certificate PDF by its ID."""
    cert = db.query(Certificate).filter(Certificate.id == certificate_id).first()
    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found",
        )

    import os
    certificates_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "certificates"
    )
    filepath = os.path.join(certificates_dir, f"certificate_{certificate_id}.pdf")

    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate file not found on server",
        )

    return FileResponse(
        path=filepath,
        media_type="application/pdf",
        filename=f"certificate_{certificate_id}.pdf",
    )
