from fastapi import APIRouter
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