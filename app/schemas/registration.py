from pydantic import BaseModel, ConfigDict
from datetime import datetime


class RegistrationCreate(BaseModel):
    event_id: int


class RegistrationResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    registration_at: datetime

    model_config = ConfigDict(from_attributes=True)
