from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from .database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    store_location = Column(String, index=True)
    incident_type = Column(String, index=True)
    merchandise_category = Column(String, index=True)
    estimated_loss = Column(Float)
    suspect_description = Column(String)
    repeat_offender = Column(String)
    status = Column(String, default="Open")
    notes = Column(Text)
    risk_score = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        unique=True,
        index=True
    )

    hashed_password = Column(String)

    role = Column(
        String,
        default="investigator"
    )