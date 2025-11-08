# routes/webhooks.py
import os
import json
from fastapi import APIRouter, Request, HTTPException
from svix.webhooks import Webhook
from db import supabase
from postgrest.exceptions import APIError

router = APIRouter()

CLERK_WEBHOOK_SECRET = os.environ.get("CLERK_WEBHOOK_SECRET")

@router.post("/api/webhooks/clerk")
async def clerk_webhook(request: Request):
    headers = request.headers
    raw_body = await request.body()
    
    # Verify the webhook
    try:
        payload_str = raw_body.decode("utf-8")
        svix_headers = {
            "svix-id": headers.get("svix-id"),
            "svix-timestamp": headers.get("svix-timestamp"),
            "svix-signature": headers.get("svix-signature"),
        }
        wh = Webhook(CLERK_WEBHOOK_SECRET)
        payload = wh.verify(payload_str, svix_headers)
        
    except Exception as e:
        print(f"Error verifying webhook: {e}")
        raise HTTPException(status_code=400, detail="Error verifying webhook")

    event_type = payload.get("type")
    
    if event_type == "user.created":
        user_data = payload.get("data", {})
        clerk_user_id = user_data.get("id")
        email_addresses = user_data.get("email_addresses", [])
        primary_email = email_addresses[0].get("email_address") if email_addresses else None

        if not clerk_user_id or not primary_email:
            print(f"Missing data - clerk_user_id: {clerk_user_id}, email: {primary_email}")
            raise HTTPException(status_code=400, detail="Missing user ID or email")

        print(f"Webhook received: Creating user {clerk_user_id} with email {primary_email}")

        try:
            # Check if user already exists (idempotency check)
            existing = supabase.table("users").select("id").eq("id", clerk_user_id).execute()
            
            if existing.data and len(existing.data) > 0:
                print(f"User {clerk_user_id} already exists, skipping insert")
                return {"status": "success", "message": "User already exists"}
            
            # Insert new user
            response = supabase.table("users").insert({
                "id": clerk_user_id,
                "email": primary_email,
            }).execute()
            
            print(f"Successfully created user {clerk_user_id}")
            return {"status": "success", "data": response.data}
            
        except APIError as e:
            # Handle duplicate key errors gracefully
            if "duplicate key" in str(e).lower() or "unique constraint" in str(e).lower():
                print(f"User {clerk_user_id} already exists (duplicate key error)")
                return {"status": "success", "message": "User already exists"}
            
            print(f"Supabase API error: {e}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        except Exception as e:
            print(f"Unexpected error inserting user: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return {"status": "success"}