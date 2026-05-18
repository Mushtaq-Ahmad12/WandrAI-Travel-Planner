"""
Ingestor Service — chunks travel guide text and stores embeddings in FAISS.
Supports PDF upload and raw text ingestion with auto-category detection.
Includes semantic chunking (1200 size, 250 overlap) and robust embedding mapping.
"""
import os
import uuid
import time
import re
import logging
from typing import List, Dict
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from services.destination_service import normalize_destination
from services.embedding_service import get_robust_embeddings

logger = logging.getLogger("wandrai.ingestor")

CATEGORY_KEYWORDS = {
    "Museum": ["museum", "gallery", "exhibition", "art", "history", "archive", "cultural centre", "exhibit"],
    "Restaurant": ["restaurant", "cafe", "coffee", "food", "dining", "cuisine", "eat", "bistro", "tavern", "eatery", "bakery", "tasting"],
    "Outdoor": ["park", "garden", "trail", "hike", "beach", "outdoor", "nature", "walk", "lake", "forest", "mountain", "viewpoint", "scenic"],
    "Nightlife": ["nightlife", "club", "bar", "pub", "evening entertainment", "cabaret", "jazz", "cocktail", "lounge"],
    "Shopping": ["shopping", "market", "mall", "shop", "store", "bazaar", "souk", "boutique", "flea market"],
    "Landmark": ["monument", "tower", "palace", "castle", "cathedral", "church", "temple", "bridge", "square", "fountain", "shrine", "architecture"],
    "Relaxation": ["spa", "relax", "yoga", "meditation", "wellness", "resort", "thermal", "hot spring", "massage", "sanctuary"],
    "Adventure": ["adventure", "extreme", "sport", "climbing", "surfing", "kayak", "zip line", "bungee", "skydive", "rafting"],
}

INDOOR_CATEGORIES = {"Museum", "Restaurant", "Shopping", "Nightlife", "Relaxation"}

def detect_category(text: str) -> str:
    text_lower = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return category
    return "Sightseeing"

def is_indoor_category(category: str) -> bool:
    return category in INDOOR_CATEGORIES

def clean_noisy_sections(text: str) -> str:
    lines = text.splitlines()
    clean_lines = []
    skip_mode = False
    
    noisy_headers = ["== external links ==", "== references ==", "== bibliography ==", "== see also ==", "== stay safe ==", "== connect =="]
    for line in lines:
        line_norm = line.strip().lower()
        if any(line_norm.startswith(h) for h in noisy_headers):
            skip_mode = True
            continue
        if skip_mode and line_norm.startswith("==") and not any(line_norm.startswith(h) for h in noisy_headers):
            skip_mode = False
        if not skip_mode:
            clean_lines.append(line)
            
    return "\n".join(clean_lines).strip()

def ingest_text(text: str, raw_city: str, source_document: str) -> int:
    city = normalize_destination(raw_city)
    clean_text = clean_noisy_sections(text)
    
    embeddings = get_robust_embeddings()
    splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=250, separators=["\n\n", "\n", ". ", " ", ""])
    chunks = splitter.split_text(clean_text)
    chunks = [c for c in chunks if len(c.strip()) >= 80]
    
    if not chunks:
        logger.warning(f"No valid chunks generated for '{city}'.")
        return 0

    documents, metadatas, ids = [], [], []
    for chunk in chunks:
        category = detect_category(chunk)
        indoor = is_indoor_category(category)
        documents.append(chunk)
        metadatas.append({
            "city": city.lower().strip(),
            "category": category,
            "source_document": source_document,
            "is_indoor": str(indoor).lower(),
            "activity_type": category.lower(),
        })
        ids.append(str(uuid.uuid4()))

    persist_dir = os.getenv("FAISS_PERSIST_DIR", "./vector_db/faiss_store")
    
    try:
        vectorstore = FAISS.load_local(persist_dir, embeddings, allow_dangerous_deserialization=True)
    except Exception:
        vectorstore = None

    # Batch embedding to respect Gemini 100 RPM free tier limits
    batch_size = 20
    for i in range(0, len(documents), batch_size):
        doc_batch = documents[i:i+batch_size]
        meta_batch = metadatas[i:i+batch_size]
        id_batch = ids[i:i+batch_size]
        
        if i > 0:
            logger.info(f"Rate limit delay: waiting 12s before batch {i // batch_size + 1}...")
            time.sleep(12)
            
        if vectorstore is None:
            vectorstore = FAISS.from_texts(texts=doc_batch, embedding=embeddings, metadatas=meta_batch, ids=id_batch)
        else:
            vectorstore.add_texts(texts=doc_batch, metadatas=meta_batch, ids=id_batch)
        
    os.makedirs(os.path.dirname(persist_dir), exist_ok=True)
    vectorstore.save_local(persist_dir)

    logger.info(f"Successfully ingested {len(documents)} chunks for '{city}'.")
    return len(documents)

async def ingest_pdf(file_bytes: bytes, filename: str, city: str) -> int:
    import tempfile
    from langchain_community.document_loaders import PyPDFLoader
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name
    try:
        loader = PyPDFLoader(tmp_path)
        pages = loader.load()
        full_text = "\n\n".join(page.page_content for page in pages)
        return ingest_text(full_text, city, filename)
    finally:
        os.unlink(tmp_path)
