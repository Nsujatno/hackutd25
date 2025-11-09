from openai import OpenAI
from typing import Dict
import os
import json

class PriorityService:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    async def assign_priority(self, ticket_data: Dict, validation_result: Dict) -> Dict:
        """
        Assign priority (P0-P4) to a ticket based on:
        - Device type and action
        - Impact (production vs new install)
        - Dependencies (blocked by inventory, etc.)
        - Location and urgency signals
        """
        
        # Build context for the LLM
        priority_prompt = f"""
You are a data center operations expert. Assign a priority level (P0-P4) to this ticket.

Priority Definitions:
- P0 (Critical): Production systems down, major outage, immediate safety risk
- P1 (High): Production degraded, critical system at risk, urgent maintenance
- P2 (Medium): Important but not urgent, scheduled maintenance, planned upgrades
- P3 (Low): Standard installations, routine tasks, non-urgent requests
- P4 (Very Low): Nice-to-have, documentation, low-priority improvements

Ticket Details:
- Action: {ticket_data.get('action', 'INSTALL')}
- Device: {ticket_data.get('device')}
- Location: Pod {ticket_data.get('pod')}, Rack {ticket_data.get('rack')}
- Required Parts: {', '.join(ticket_data.get('required_parts', []))}

Validation Results:
- Warnings: {', '.join(validation_result.get('warnings', [])) if validation_result.get('warnings') else 'None'}
- Inventory Issues: {'Yes' if any('inventory' in w.lower() for w in validation_result.get('warnings', [])) else 'No'}

Context Clues:
- Is this a new installation or troubleshooting? {"Troubleshooting" if "troubleshoot" in ticket_data.get('action', '').lower() else "New Installation"}
- Any production impact mentioned? {"Yes" if any(keyword in str(ticket_data).lower() for keyword in ['production', 'down', 'outage', 'critical', 'urgent']) else "No"}

Respond in JSON format:
{{
  "priority": "P0" | "P1" | "P2" | "P3" | "P4",
  "justification": "Brief 1-2 sentence explanation of why this priority was assigned",
  "estimated_duration_minutes": <integer estimate of how long this will take>
}}
"""
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": priority_prompt}],
                response_format={"type": "json_object"},
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            # Fallback to P3 if AI fails
            return {
                "priority": "P3",
                "justification": f"Default priority assigned due to error: {str(e)}",
                "estimated_duration_minutes": 30
            }
