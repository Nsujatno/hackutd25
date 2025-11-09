from fastapi import APIRouter, HTTPException, Depends, Header
from db import supabase
from typing import Optional
from routes.tickets import get_current_user_id


# Create a new router instance
router = APIRouter()

@router.get("/")
async def get_all_users():
    response = supabase.table("users").select("*").execute()
    return response.data

# @router.get("/{user_id}")
# async def get_user_by_id(user_id: str):
#     return supabase.table("users").select("*").eq("id", user_id).single().execute().data

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

@router.get("/get_role")
# def read_root():
#     return {"Hello": "World"}
async def get_user_role_endpoint(current_user_id: Optional[str] = Depends(get_current_user_id)):
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    print(f"Looking up role for user_id: {current_user_id}")

    try:
        result = supabase.table("user_roles")\
            .select("role")\
            .eq("user_id", current_user_id)\
            .execute()

        print(f"Supabase query result data: {result.data}")  # Add this print

        if result.data and len(result.data) > 0:
            role = result.data[0].get("role")  # get role properly
            print(f"Extracted role: {role}")
        else:
            role = "technician"
            print("No role record found, defaulting to 'technician'")

        return {"role": role}
    except Exception as e:
        print(f"Exception in get_user_role_endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/test")
async def test_route():
    print("Test route hit")
    return {"message": "OK"}