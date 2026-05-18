"""
POST /api/upload-guides  — upload PDF travel guide → ingest into FAISS
POST /api/upload-text    — ingest raw text guide content
"""
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.ingestor_service import ingest_pdf, ingest_text
from services.destination_service import normalize_destination

logger = logging.getLogger("wandrai.guides")
router = APIRouter()

@router.post("/upload-guides")
async def upload_guide(
    file: UploadFile = File(...),
    city: str = Form(..., description="City this guide covers, e.g. Paris"),
):
    """Upload a PDF travel guide and ingest it into the vector database."""
    norm_city = normalize_destination(city)
    logger.info(f"Received PDF upload '{file.filename}' for destination '{norm_city}'")
    
    if not file.filename.lower().endswith(".pdf"):
        logger.warning(f"Rejected non-PDF upload: '{file.filename}'")
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    try:
        file_bytes = await file.read()
        count = await ingest_pdf(file_bytes, file.filename, norm_city)
        logger.info(f"Successfully ingested {count} chunks from '{file.filename}' for '{norm_city}'.")
        return {
            "message": f"Successfully ingested '{file.filename}' for {norm_city}",
            "chunks_stored": count,
            "city": norm_city,
        }
    except Exception as e:
        logger.error(f"PDF ingestion error for '{file.filename}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Ingestion error: {str(e)}")

@router.post("/upload-text")
async def upload_text_guide(
    text: str = Form(...),
    city: str = Form(...),
    source: str = Form(default="Manual Upload"),
):
    """Ingest raw travel guide text for a city."""
    norm_city = normalize_destination(city)
    logger.info(f"Received raw text guide upload ({len(text)} chars) for '{norm_city}' from source '{source}'")
    try:
        count = ingest_text(text, norm_city, source)
        logger.info(f"Successfully ingested {count} text chunks for '{norm_city}'.")
        return {
            "message": f"Successfully ingested text for {norm_city}",
            "chunks_stored": count,
            "city": norm_city,
        }
    except Exception as e:
        logger.error(f"Text ingestion error for '{norm_city}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Ingestion error: {str(e)}")
