from fastapi import APIRouter, HTTPException
from schemas import QueryRequest, QueryResponse
from services.rag_service import process_query

router = APIRouter()

@router.post("/query", response_model=QueryResponse)
async def query_knowledge_base(request: QueryRequest):
    try:
        result = await process_query(request.query)
        return QueryResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    return {"status": "healthy"}
