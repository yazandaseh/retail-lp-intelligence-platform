from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class IncidentCreate(BaseModel):
    store_location: str
    incident_type: str
    merchandise_category: str
    estimated_loss: float
    suspect_description: Optional[str] = None
    repeat_offender: str
    status: str = "Open"
    notes: Optional[str] = None

class IncidentResponse(IncidentCreate):
    id: int
    risk_score: int
    created_at: datetime

    class Config:
        from_attributes = True