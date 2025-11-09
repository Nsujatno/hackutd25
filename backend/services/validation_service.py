from services.datacenter_rag import DatacenterRAG
from services.rag_service import process_query
from openai import OpenAI
from typing import Dict, List
import os
import json

class TicketValidationService:
    def __init__(self):
        self.datacenter_rag = DatacenterRAG()
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def validate_ticket(self, ticket_data: Dict) -> Dict:
        warnings = []
        suggestions = []
        requirements = []
        datacenter_context = []
        technical_context = []

        location_query = f"switch {ticket_data.get('switch')} location pod {ticket_data.get('pod')}"
        location_results = self.datacenter_rag.query(
            location_query,
            match_count=3,
            filter_type="switch_status"
        )
        if location_results:
            datacenter_context.extend(location_results[:2])
            # Use GPT model to interpret result
            validation_prompt = f"""
            The user wants to cable to {ticket_data.get('switch')} in {ticket_data.get('pod')}.
            
            Here's what I found in the datacenter records:
            {location_results[0]['content']}
            
            Is there a location mismatch? If yes, suggest the correct switch.
            Respond in JSON format: {{"has_error": bool, "warning": str, "suggestion": str}}
            """
            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": validation_prompt}],
                    response_format={"type": "json_object"}
                )
                result = json.loads(response.choices[0].message.content)
                if result["has_error"]:
                    warnings.append(result["warning"])
                    suggestions.append(result["suggestion"])
            except Exception as e:
                warnings.append(f"Location validation error: {e}")

        if "required_parts" in ticket_data:
            for part in ticket_data["required_parts"]:
                inventory_query = f"inventory availability {part}"
                inventory_results = self.datacenter_rag.query(
                    inventory_query,
                    match_count=2,
                    filter_type="inventory"
                )
                if inventory_results:
                    inventory_prompt = f"""
                    The user needs: {part}
                    
                    Inventory status:
                    {inventory_results[0]['content']}
                    
                    Is this part available? If not, suggest alternatives.
                    Respond in JSON: {{"available": bool, "quantity": int, "warning": str, "alternative": str}}
                    """
                    try:
                        response = self.openai_client.chat.completions.create(
                            model="gpt-4o-mini",
                            messages=[{"role": "user", "content": inventory_prompt}],
                            response_format={"type": "json_object"}
                        )
                        result = json.loads(response.choices[0].message.content)
                        if not result["available"]:
                            warnings.append(result["warning"])
                            if result.get("alternative"):
                                suggestions.append(result["alternative"])
                    except Exception as e:
                        warnings.append(f"Inventory validation error: {e}")

        device = ticket_data.get("device", "")
        technical_answer = None
        if device:
            tech_query = f"{device} installation requirements power cables specifications"
            try:
                technical_answer = await process_query(tech_query)
                requirements.append(technical_answer["answer"])
                technical_context = technical_answer["sources"]
            except Exception as e:
                warnings.append(f"Technical RAG error: {e}")

        return {
            "is_valid": len(warnings) == 0,
            "warnings": warnings,
            "suggestions": suggestions,
            "technical_requirements": requirements,
            "datacenter_context": datacenter_context,
            "technical_context": technical_context
        }
