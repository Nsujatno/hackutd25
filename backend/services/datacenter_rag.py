from supabase import create_client, Client
from openai import OpenAI
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv


load_dotenv()


class DatacenterRAG:
    def __init__(self):
        # Initialize Supabase client
        self.supabase: Client = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_KEY")
        )
        
        # Initialize OpenAI client
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
    def generate_embedding(self, text: str) -> List[float]:
        response = self.openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=text
        )
        return response.data[0].embedding
    
    def add_document(
        self, 
        content: str, 
        document_type: str, 
        metadata: Optional[Dict] = None
    ) -> Dict:
        # Generate embedding
        embedding = self.generate_embedding(content)
        
        # Insert into Supabase
        result = self.supabase.table("datacenter_knowledge").insert({
            "content": content,
            "document_type": document_type,
            "metadata": metadata or {},
            "embedding": embedding
        }).execute()
        
        return result.data[0] if result.data else None
    
    def query(
        self, 
        query_text: str, 
        match_threshold: float = 0.7,
        match_count: int = 5,
        filter_type: Optional[str] = None
    ) -> List[Dict]:
        # Generate embedding for the query
        query_embedding = self.generate_embedding(query_text)
        
        # Call the Postgres function for similarity search
        result = self.supabase.rpc(
            "match_datacenter_documents",
            {
                "query_embedding": query_embedding,
                "match_threshold": match_threshold,
                "match_count": match_count,
                "filter_type": filter_type
            }
        ).execute()
        
        return result.data
    
    def update_document(self, doc_id: int, content: str, metadata: Optional[Dict] = None):
        embedding = self.generate_embedding(content)
        
        update_data = {
            "content": content,
            "embedding": embedding,
            "updated_at": "now()"
        }
        
        if metadata:
            update_data["metadata"] = metadata
        
        result = self.supabase.table("datacenter_knowledge")\
            .update(update_data)\
            .eq("id", doc_id)\
            .execute()
        
        return result.data[0] if result.data else None
    
    def delete_document(self, doc_id: int):
        """Delete a document from the knowledge base"""
        result = self.supabase.table("datacenter_knowledge")\
            .delete()\
            .eq("id", doc_id)\
            .execute()
        
        return result
