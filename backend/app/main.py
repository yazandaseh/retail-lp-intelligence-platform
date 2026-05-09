from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from .database import Base, engine, get_db
from .models import Incident
from .schemas import IncidentCreate, IncidentResponse
from .risk import calculate_risk_score
from .auth import router as auth_router
from .security import verify_access_token, require_roles

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Retail Loss Prevention Intelligence API",
    description="Backend API for tracking incidents, theft patterns, and risk scores.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/")
def home():
    return {"message": "Retail Loss Prevention Intelligence API is running"}


@app.post("/incidents", response_model=IncidentResponse)
def create_incident(
    incident: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles(["admin", "investigator"]))
):
    risk_score = calculate_risk_score(
        incident.estimated_loss,
        incident.incident_type,
        incident.repeat_offender
    )

    new_incident = Incident(
        store_location=incident.store_location,
        incident_type=incident.incident_type,
        merchandise_category=incident.merchandise_category,
        estimated_loss=incident.estimated_loss,
        suspect_description=incident.suspect_description,
        repeat_offender=incident.repeat_offender,
        status=incident.status,
        notes=incident.notes,
        risk_score=risk_score
    )

    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    return new_incident


@app.get("/incidents", response_model=List[IncidentResponse])
def get_incidents(
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_access_token)
):
    return db.query(Incident).order_by(Incident.created_at.desc()).all()


@app.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_access_token)
):
    incidents = db.query(Incident).all()

    total_incidents = len(incidents)
    total_loss = sum(i.estimated_loss for i in incidents)
    open_cases = len([i for i in incidents if i.status == "Open"])
    high_risk_cases = len([i for i in incidents if i.risk_score >= 70])

    return {
        "total_incidents": total_incidents,
        "total_loss": total_loss,
        "open_cases": open_cases,
        "high_risk_cases": high_risk_cases
    }