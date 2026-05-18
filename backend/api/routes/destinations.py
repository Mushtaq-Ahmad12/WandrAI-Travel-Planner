"""
GET /api/destinations — list all cities with indexed travel guide data
"""
import os
import logging
from fastapi import APIRouter, HTTPException
from langchain_community.vectorstores import FAISS
from services.destination_service import normalize_destination
from services.embedding_service import get_robust_embeddings

logger = logging.getLogger("wandrai.destinations")
router = APIRouter()

@router.get("/destinations")
async def get_destinations():
    """Return all normalized cities that have been ingested into the vector database."""
    try:
        persist_dir = os.getenv("FAISS_PERSIST_DIR", "./vector_db/faiss_store")
        if not os.path.exists(persist_dir):
            return {"destinations": [], "total": 0}
            
        embeddings = get_robust_embeddings()
        vectorstore = FAISS.load_local(persist_dir, embeddings, allow_dangerous_deserialization=True)
        
        cities = set()
        for doc_id, doc in vectorstore.docstore._dict.items():
            if "city" in doc.metadata:
                norm_c = normalize_destination(doc.metadata["city"])
                cities.add(norm_c)
                
        sorted_cities = sorted(list(cities))
        logger.info(f"Listed {len(sorted_cities)} indexed destinations.")
        return {"destinations": sorted_cities, "total": len(sorted_cities)}
    except Exception as e:
        logger.error(f"Failed to list destinations: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Database retrieval error: {str(e)}")
