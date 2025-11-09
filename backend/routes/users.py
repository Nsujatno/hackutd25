from fastapi import APIRouter, HTTPException
from db import supabase


# Create a new router instance
router = APIRouter()

@router.get("/")
async def get_all_users():
    response = supabase.table("users").select("*").execute()
    return response.data

@router.get("/{user_id}")
async def get_user_by_id(user_id: str):
    return supabase.table("users").select("*").eq("id", user_id).single().execute().data

@router.get("/technicians")
async def list_technicians():
    """
    Get list of all technicians for assignment dropdown.
    Returns email and user_id.
    """
    try:
        # Get all users with technician role
        technician_ids = supabase.table("user_roles")\
            .select("user_id")\
            .eq("role", "technician")\
            .execute()
        
        if not technician_ids.data:
            return {"users": []}
        
        # Extract user_ids
        user_ids = [item["user_id"] for item in technician_ids.data]
        
        # Get user details from users table
        result = supabase.table("users")\
            .select("user_id, email")\
            .in_("user_id", user_ids)\
            .execute()
        
        return {"users": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
