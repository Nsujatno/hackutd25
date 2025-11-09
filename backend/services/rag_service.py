import os
from dotenv import load_dotenv
from openai import OpenAI
from db import supabase
from typing import List, Dict

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client with API key from environment
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def generate_query_embedding(query: str) -> List[float]:
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=query
    )
    return response.data[0].embedding

async def search_similar_chunks(query_embedding: List[float], match_count: int = 3) -> List[Dict]:
    response = supabase.rpc(
        'match_documents',
        {
            'query_embedding': query_embedding,
            'match_threshold': 0.78,
            'match_count': match_count
        }
    ).execute()
    
    return response.data

async def generate_answer(query: str, chunks: List[Dict]) -> str:
    
    # Build context from retrieved chunks
    context = "\n\n".join([
        f"[Source: {chunk['metadata']['source']}, Page {chunk['metadata'].get('page', 'N/A')}]\n{chunk['content']}"
        for chunk in chunks
    ])
    
    # Create prompt for gpt-4o-mini
    messages = [
        {"role": "system", "content": "You are a technical assistant for data center technicians. Provide concise, accurate answers (2-3 sentences) based solely on the provided manual excerpts. Always cite the source manual."},
        {"role": "user", "content": f"Context from manuals:\n{context}\n\nQuestion: {query}\n\nProvide a clear answer with source citations."}
    ]
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.3,
        max_tokens=200
    )
    
    return response.choices[0].message.content

async def process_query(query: str) -> Dict:
    """Main RAG pipeline: embed -> search -> generate"""
    
    # Generate embedding for query
    query_embedding = await generate_query_embedding(query)
    
    # Search for similar chunks
    chunks = await search_similar_chunks(query_embedding)
    
    if not chunks:
        return {
            "answer": "I couldn't find relevant information in the manuals for that question.",
            "sources": []
        }
    
    # Generate answer
    answer = await generate_answer(query, chunks)
    
    # Extract sources
    sources = [
        f"{chunk['metadata']['source']}, pg {chunk['metadata'].get('page', 'N/A')}"
        for chunk in chunks
    ]
    
    return {
        "answer": answer,
        "sources": list(set(sources))  # Remove duplicates
    }
