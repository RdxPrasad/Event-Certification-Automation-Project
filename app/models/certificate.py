from sqlalchemy import Column , Integer , String , DateTime , ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Certificate(Base) :

    __tablename__ = "certificates"

    id = Column(Integer , primary_key=True , index=True , autoincrement=True)
    user_id = Column(Integer , ForeignKey("users.id") , nullable=False)
    event_id = Column(Integer , ForeignKey("events.id") , nullable=False)
    certificate_url = Column(String(500) , nullable=False)
    issued_at = Column(DateTime , default=datetime.utcnow)

    user = relationship("User" , back_populates="certificates")
    event = relationship("Event" , back_populates="certificates")