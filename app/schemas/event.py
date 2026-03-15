from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: datetime
    location: Optional[str] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None


class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    date: datetime
    location: Optional[str]
    organizer_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
