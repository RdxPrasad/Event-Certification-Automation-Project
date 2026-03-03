from sqlalchemy import Column , Integer , String , DateTime
from datetime import datetime
from app.database import Base
from sqlalchemy.orm import relationship


class User(Base) :

    __tablename__ = "users"

    id =  Column(Integer , primary_key=True , index=True , autoincrement=True)
    full_name = Column(String(100) , nullable=False)
    email = Column(String(100) , unique=True , nullable=False)
    hashed_password = Column(String(255) , nullable=False)
    role = Column(String(20) , default="student")
    created_at = Column(DateTime , default=datetime.utcnow)

    events  =  relationship("Event" , back_populates = "organizer")
    registrations = relationship("Registration" , back_populates="user")
    certificates = relationship("Certificate" , back_populates="user")
