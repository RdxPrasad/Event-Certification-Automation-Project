from pydantic import BaseModel, ConfigDict
from datetime import datetime


class CertificateCreate(BaseModel):
    user_id: int
    event_id: int


class CertificateResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    certificate_url: str
    issued_at: datetime

    model_config = ConfigDict(from_attributes=True)
