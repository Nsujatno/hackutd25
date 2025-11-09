from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional, Dict
from services.validation_service import TicketValidationService
from db import supabase
from clerk_backend_api import Clerk
import os
import jwt

clerk_client = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

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


class TicketCreateRequest(BaseModel):
    device: str
    pod: str
    rack: Optional[str]
    switch: Optional[str]
    ports: Optional[List[str]]
    required_parts: Optional[List[str]] = []
    action: Optional[str] = "INSTALL"
    description: Optional[str] = ""
    assign_to_email: Optional[str] = None


class TicketResponse(BaseModel):
    success: bool
    message: str
    ticket: Optional[Dict] = None
    validation: Optional[Dict] = None
    priority: Optional[Dict] = None


class TicketAssignRequest(BaseModel):
    technician_id: str


class TicketStatusUpdate(BaseModel):
    status: str

async def get_user_id_by_email(email: str) -> Optional[str]:
    """Look up user_id from email"""
    try:
        # Strip whitespace and convert to lowercase
        clean_email = email.strip().lower()
        
        result = supabase.table("users")\
            .select("id, email")\
            .execute()
        
        # Manual search with normalized comparison
        for user in result.data:
            if user.get("email", "").strip().lower() == clean_email:
                return user.get("id")
        
        print(f"No match found for email: {email}")
        return None
            
    except Exception as e:
        print(f"User lookup error: {e}")
        return None


async def get_current_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    try:
        token = authorization.replace("Bearer ", "")
        
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        # Clerk stores user ID in 'sub' claim
        user_id = decoded.get('sub')
        return user_id
    except Exception as e:
        print(f"Auth error: {e}")
        return None
    # return "user_35DyPmnDNyI6iqNHvS1D20M4Bcc"


async def get_user_role(user_id: Optional[str] = None) -> Optional[str]:
    """Get user role from Supabase"""
    if not user_id:
        return None
    
    try:
        result = supabase.table("user_roles")\
            .select("role")\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        return result.data.get("role") if result.data else "technician"
    except:
        return "technician"  # Default role


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/validate", response_model=ValidationResponse)
async def validate_ticket(ticket: TicketCreate):
    """Validate ticket using dual-RAG system"""
    try:
        result = await validation_service.validate_ticket(ticket.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create", response_model=TicketResponse)
async def create_ticket(
    ticket: TicketCreateRequest,
    current_user_id: Optional[str] = Depends(get_current_user_id)
):
    """
    Complete ticket creation flow:
    1. Validate with dual-RAG
    2. Assign priority with AI
    3. Look up assignee by email (if provided)
    4. Store in Supabase
    """
    try:
        # Check user role
        user_role = await get_user_role(current_user_id)
        if user_role not in ['ticket_creator', 'admin']:
            raise HTTPException(
                status_code=403, 
                detail="Only ticket creators can create tickets"
            )
        
        # Look up assignee user_id from email
        assigned_to_user_id = None
        if ticket.assign_to_email:
            assigned_to_user_id = await get_user_id_by_email(ticket.assign_to_email)
            if not assigned_to_user_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"User with email '{ticket.assign_to_email}' not found"
                )
        
        # Create validated ticket
        ticket_dict = ticket.dict()
        ticket_dict['assigned_to_user_id'] = assigned_to_user_id  # Add resolved user_id
        
        result = await validation_service.create_validated_ticket(
            ticket_dict,
            user_id=current_user_id
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/list")
async def list_tickets(
    status: Optional[str] = None,
    current_user_id: Optional[str] = Depends(get_current_user_id)
):
    """
    Get tickets based on user role:
    - Ticket creators/admins see ALL tickets
    - Technicians see only their assigned tickets + unassigned tickets
    
    RLS policies automatically filter results.
    """
    try:
        query = supabase.table("tickets")\
            .select("*")\
            .order("priority")\
            .order("created_at", desc=True)
        
        if status:
            query = query.eq("status", status)
        
        result = query.execute()
        return {"tickets": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/my-tickets")
async def get_my_tickets(
    current_user_id: Optional[str] = Depends(get_current_user_id)
):
    """
    Get tickets assigned to current user (for technicians)
    """
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        result = supabase.table("tickets")\
            .select("*")\
            .eq("assigned_to", current_user_id)\
            .order("priority")\
            .order("created_at", desc=True)\
            .execute()
        
        return {"tickets": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: str,
    status_update: TicketStatusUpdate,  # Pydantic model for body
    current_user_id: Optional[str] = Depends(get_current_user_id)
):
    """Update ticket status (for Kanban drag-and-drop)"""
    new_status = status_update.status
    
    # Validate status
    if new_status not in ["ready", "in_progress", "complete"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid status: {new_status}. Must be one of: ready, in_progress, complete"
        )
    
    try:
        # Build update data
        update_data = {"status": new_status}
        
        # Track timestamps
        if new_status == "in_progress":
            update_data["started_at"] = "now()"
        elif new_status == "complete":
            update_data["completed_at"] = "now()"
        
        # Update in Supabase
        result = supabase.table("tickets")\
            .update(update_data)\
            .eq("id", ticket_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=404, 
                detail="Ticket not found or unauthorized"
            )
        
        return {"success": True, "ticket": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating ticket: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{ticket_id}/assign")
async def assign_ticket(
    ticket_id: str,
    assignment: TicketAssignRequest,
    current_user_id: Optional[str] = Depends(get_current_user_id)
):
    """
    Assign a ticket to a technician.
    Only ticket creators and admins can assign tickets.
    """
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Check if current user is ticket_creator or admin
        user_role = await get_user_role(current_user_id)
        if user_role not in ['ticket_creator', 'admin']:
            raise HTTPException(
                status_code=403, 
                detail="Only ticket creators can assign tickets"
            )
        
        # Assign ticket
        result = supabase.table("tickets")\
            .update({"assigned_to": assignment.technician_id})\
            .eq("id", ticket_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        return {"success": True, "ticket": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{ticket_id}")
async def delete_ticket(
    ticket_id: str,
    current_user_id: Optional[str] = Depends(get_current_user_id)
):
    """
    Delete a ticket.
    Only ticket creators and admins can delete tickets.
    """
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Check if current user is ticket_creator or admin
        user_role = await get_user_role(current_user_id)
        if user_role not in ['ticket_creator', 'admin']:
            raise HTTPException(
                status_code=403, 
                detail="Only ticket creators can delete tickets"
            )
        
        result = supabase.table("tickets")\
            .delete()\
            .eq("id", ticket_id)\
            .execute()
        
        return {"success": True, "message": "Ticket deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{ticket_id}")
async def get_ticket(
    ticket_id: str,
    current_user_id: Optional[str] = Depends(get_current_user_id)
):
    """Get a single ticket by ID"""
    try:
        result = supabase.table("tickets")\
            .select("*")\
            .eq("id", ticket_id)\
            .single()\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        return {"ticket": result.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
