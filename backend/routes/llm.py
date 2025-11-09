import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from openai import OpenAI
from typing import List, Optional

# Load env vars
load_dotenv()

# Initialize OpenAI client (new way for openai>=1.0.0)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

if not client.api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables. Please check your .env file.")

router = APIRouter()

class TicketData(BaseModel):
    device: Optional[str] = None
    pod: Optional[str] = None
    rack: Optional[str] = None
    switch: Optional[str] = None
    ports: Optional[List[str]] = None
    required_parts: Optional[List[str]] = None
    action: Optional[str] = None
    description: Optional[str] = None
    assign_to_email: Optional[EmailStr] = None

class ChatMessage(BaseModel):
    message: str
    ticket_data: TicketData

class ChatResponse(BaseModel):
    response: str
    ticket_data: TicketData
    is_complete: bool
    missing_fields: List[str]

SYSTEM_PROMPT = """You are a helpful assistant that extracts ticket information from user messages.

Your job is to:
1. Extract the following fields from user messages:
   - device: GPU type (H100, A100, H200, etc.)
   - pod: Pod number (e.g., "Pod 7")
   - rack: Rack location (e.g., "42U")
   - switch: Switch identifier (e.g., "switch-7b")
   - ports: List of port numbers (e.g., ["49", "50"])
   - required_parts: List of parts needed (e.g., ["3m_DAC_cable", "16pin_power"])
   - action: One of: FIX, INSTALL, REPLACE, UPGRADE
   - description: Brief description of the work
   - assign_to_email: Email address of assignee

2. Maintain context from previous messages and only update fields that are mentioned
3. Be conversational and guide the user to provide missing information
4. When all fields are complete, confirm with the user

Respond with a JSON object containing:
{
  "extracted_data": {
    "device": "value or null",
    "pod": "value or null",
    "rack": "value or null",
    "switch": "value or null",
    "ports": ["list"] or null,
    "required_parts": ["list"] or null,
    "action": "value or null",
    "description": "value or null",
    "assign_to_email": "value or null"
  },
  "response_message": "Your conversational response to the user",
  "missing_fields": ["list of missing field names"]
}

Common parts:
- 3m_DAC_cable: DAC cable, cable
- 16pin_power: 16-pin power, power cable
- SFP_transceiver: SFP, transceiver

Be friendly and natural in your responses!"""

@router.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(chat_data: ChatMessage):
    """
    Process user message and extract ticket information using GPT-4o-mini
    """
    try:
        print(f"[DEBUG] Received message: {chat_data.message}")
        
        # Prepare the conversation context
        user_message = chat_data.message
        current_ticket_data = chat_data.ticket_data.dict()
        
        # Build context about current ticket state
        context = f"Current ticket data: {json.dumps(current_ticket_data, indent=2)}\n\nUser message: {user_message}"
        
        print("[DEBUG] Calling OpenAI API...")
        
        # Call OpenAI API using new client method
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": context}
            ],
            temperature=0.7,
            max_tokens=500,
            timeout=30  # 30 second timeout
        )
        
        print("[DEBUG] OpenAI API response received")
        
        # Parse the response (new client returns different structure)
        ai_response = response.choices[0].message.content
        
        print(f"[DEBUG] AI Response: {ai_response[:200]}...")  # Print first 200 chars
        
        # Try to extract JSON from response
        try:
            # Sometimes GPT wraps JSON in markdown code blocks
            if "```json" in ai_response:
                ai_response = ai_response.split("```json")[1].split("```")[0].strip()
            elif "```" in ai_response:
                ai_response = ai_response.split("```")[1].split("```")[0].strip()
            
            parsed_response = json.loads(ai_response)
            print("[DEBUG] Successfully parsed JSON response")
        except json.JSONDecodeError as e:
            print(f"[DEBUG] JSON parsing failed: {e}")
            print(f"[DEBUG] Raw response: {ai_response}")
            # Fallback if JSON parsing fails
            return ChatResponse(
                response="I'm having trouble processing that. Could you rephrase?",
                ticket_data=chat_data.ticket_data,
                is_complete=False,
                missing_fields=[]
            )
        
        # Merge extracted data with current data
        extracted = parsed_response.get("extracted_data", {})
        updated_ticket_data = current_ticket_data.copy()
        
        for key, value in extracted.items():
            if value is not None and value != "":
                if isinstance(value, list) and len(value) > 0:
                    updated_ticket_data[key] = value
                elif not isinstance(value, list):
                    updated_ticket_data[key] = value
        
        print(f"[DEBUG] Updated ticket data: {updated_ticket_data}")
        
        # Check if all fields are complete
        required_fields = ["device", "pod", "rack", "switch", "ports", "required_parts", "action", "assign_to_email"]
        missing_fields = [field for field in required_fields if not updated_ticket_data.get(field)]
        is_complete = len(missing_fields) == 0
        
        print(f"[DEBUG] Is complete: {is_complete}, Missing fields: {missing_fields}")
        
        return ChatResponse(
            response=parsed_response.get("response_message", "Got it!"),
            ticket_data=TicketData(**updated_ticket_data),
            is_complete=is_complete,
            missing_fields=missing_fields
        )
        
    except Exception as e:
        print(f"[ERROR] Exception in chat_endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")