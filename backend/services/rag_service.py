"""
RAG Service — retrieves relevant travel guide chunks from FAISS
filtered by normalized destination city, travel style, and budget.
Includes semantic deduplication and top_k=10 precision retrieval.
"""
import os
import logging
from typing import List, Dict
from langchain_community.vectorstores import FAISS
from services.destination_service import normalize_destination
from services.embedding_service import get_robust_embeddings

logger = logging.getLogger("wandrai.rag")

STYLE_TERMS = {
    "Adventure": "adventure outdoor hiking extreme sports nature trails scenic viewpoint climbing",
    "Cultural": "museum gallery history landmark cathedral monument heritage architecture temple shrine",
    "Relaxation": "spa wellness relaxation peaceful quiet resort scenic garden beach thermal massage",
    "Food": "restaurant dining cuisine food local dishes cafe market tasting bakery street food bistro",
}

BUDGET_TERMS = {
    "Low": "free cheap affordable budget backpacker low cost market street food public walking",
    "Medium": "mid-range moderate reasonable value authentic bistro cafe attraction ticket",
    "Luxury": "luxury premium exclusive fine dining upscale five star private guided VIP fine wine",
}

def build_semantic_query(destination: str, travel_style: str, budget: str, interests: List[str]) -> str:
    norm_dest = normalize_destination(destination)
    style = STYLE_TERMS.get(travel_style, "")
    budget_t = BUDGET_TERMS.get(budget, "")
    interest_t = " ".join(interests)
    return f"{norm_dest} {style} {budget_t} {interest_t} top attractions activities sightseeing guide"

def retrieve_context(destination: str, travel_style: str, budget: str, interests: List[str], n_results: int = 15) -> List[Dict]:
    norm_dest = normalize_destination(destination)
    embeddings = get_robust_embeddings()
    persist_dir = os.getenv("FAISS_PERSIST_DIR", "./vector_db/faiss_store")
    
    try:
        vectorstore = FAISS.load_local(persist_dir, embeddings, allow_dangerous_deserialization=True)
    except Exception as e:
        logger.warning(f"FAISS index not found or empty: {e}")
        return []

    query = build_semantic_query(norm_dest, travel_style, budget, interests)
    city_key = norm_dest.lower().strip()

    try:
        docs_and_scores = vectorstore.similarity_search_with_score(
            query, k=n_results * 2, filter={"city": city_key}
        )
        if not docs_and_scores:
            raise ValueError("No results with strict metadata filter.")
    except Exception:
        docs_and_scores = vectorstore.similarity_search_with_score(query, k=n_results * 3)
        docs_and_scores = [d for d in docs_and_scores if d[0].metadata.get("city") == city_key]

    chunks = []
    for doc, score in docs_and_scores:
        chunks.append({
            "text": doc.page_content,
            "metadata": doc.metadata,
            "relevance_score": float(score),
        })

    seen_snippets = set()
    unique_chunks = []
    cat_counts = {}

    for chunk in chunks:
        snippet = "".join(chunk["text"].lower().split())[:60]
        if snippet in seen_snippets:
            continue
        seen_snippets.add(snippet)
        
        cat = chunk["metadata"].get("category", "Sightseeing")
        if cat_counts.get(cat, 0) < 4:
            unique_chunks.append(chunk)
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
            
        if len(unique_chunks) >= 10:
            break

    return unique_chunks

def format_context_for_llm(chunks: List[Dict]) -> str:
    if not chunks:
        return "No travel guide data available for this destination."
    lines = ["=== RETRIEVED TRAVEL GUIDE CONTEXT ===\n"]
    for i, chunk in enumerate(chunks, 1):
        meta = chunk["metadata"]
        lines.append(f"[CHUNK {i}]")
        lines.append(f"Source: {meta.get('source_document', 'Authoritative Travel Guide')}")
        lines.append(f"Category: {meta.get('category', 'Sightseeing')}")
        lines.append(f"Indoor: {meta.get('is_indoor', 'false')}")
        lines.append(f"Content: {chunk['text']}")
        lines.append("")
    return "\n".join(lines)
