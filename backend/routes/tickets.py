from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.validation_service import TicketValidationService

router = APIRouter(prefix="/api/tickets", tags=["tickets"])
validation_service = TicketValidationService()

class TicketCreate(BaseModel):
    device: str
    pod: str
    rack: Optional[str]
    switch: Optional[str]
    ports: Optional[List[str]]
    required_parts: Optional[List[str]] = []

class ValidationResponse(BaseModel):
    is_valid: bool
    warnings: List[str]
    suggestions: List[str]
    technical_requirements: List[str]

@router.post("/validate", response_model=ValidationResponse)
async def validate_ticket(ticket: TicketCreate):
    """Validate ticket using dual-RAG system"""
    try:
        result = await validation_service.validate_ticket(ticket.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
