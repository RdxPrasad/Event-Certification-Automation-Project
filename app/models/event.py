from sqlalchemy import Column , Integer , String , DateTime , ForeignKey
from datetime import datetime
from app.database import Base
from sqlalchemy.orm import relationship


class Event(Base) :

    __tablename__ = "events"

    id  =  Column(Integer , primary_key=True , index=True , autoincrement=True)
    title  =  Column(String(100) , nullable=False)
    description = Column(String(1000) , nullable=True)
    date  =  Column(DateTime , nullable=False)
    location  =  Column(String(200) , nullable=True) 
    organizer_id  =  Column(Integer , ForeignKey("users.id") , nullable=False)
    created_at  =  Column(DateTime , default=datetime.utcnow)

    organizer  =  relationship("User", back_populates = "events")
    registrations = relationship("Registration" , back_populates="event")
    certificates = relationship("Certificate" , back_populates="event")