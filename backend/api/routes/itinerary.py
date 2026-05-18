"""
POST /api/generate-itinerary
Orchestrates: weather fetch → RAG retrieval → LLM generation
"""
import sys
import os
import logging
from fastapi import APIRouter, HTTPException
from models.itinerary import ItineraryRequest, ItineraryResponse
from services.weather_service import get_weather_forecast
from services.rag_service import retrieve_context, format_context_for_llm
from services.llm_service import generate_itinerary
from services.destination_service import normalize_destination

# Add scripts directory to path to import fetch_and_ingest
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "scripts"))
from fetch_wikivoyage import fetch_and_ingest

logger = logging.getLogger("wandrai.itinerary")
router = APIRouter()

@router.post("/generate-itinerary", response_model=ItineraryResponse)
async def generate_itinerary_endpoint(request: ItineraryRequest):
    """
    Generate a complete RAG-grounded, weather-aware travel itinerary.
    """
    norm_dest = normalize_destination(request.destination)
    logger.info(f"Received itinerary request for '{request.destination}' (normalized: '{norm_dest}')")
    
    # Validate date range
    if request.end_date < request.start_date:
        logger.warning(f"Invalid date range: {request.start_date} to {request.end_date}")
        raise HTTPException(status_code=400, detail="end_date must be at or after start_date.")
    duration = (request.end_date - request.start_date).days + 1
    if duration > 14:
        logger.warning(f"Trip duration exceeds limit: {duration} days")
        raise HTTPException(status_code=400, detail="Maximum trip duration is 14 days.")

    # Step 1: Weather forecast
    try:
        logger.info(f"Fetching weather forecast for {norm_dest}...")
        weather = await get_weather_forecast(norm_dest, request.start_date, request.end_date)
    except ValueError as e:
        logger.warning(f"Weather geocoding error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Weather API error: {e}", exc_info=True)
        raise HTTPException(status_code=502, detail=f"Weather API error: {str(e)}")

    # Step 2: RAG retrieval
    logger.info(f"Retrieving RAG context for {norm_dest}...")
    chunks = retrieve_context(
        destination=norm_dest,
        travel_style=request.travel_style,
        budget=request.budget,
        interests=request.interests,
    )
    
    # Auto-fetch if no data is found!
    if not chunks:
        try:
            logger.info(f"No indexed data for '{norm_dest}'. Triggering auto-fetch from Wikivoyage/Wikipedia...")
            count = fetch_and_ingest(norm_dest, verbose=False)
            if count > 0:
                chunks = retrieve_context(
                    destination=norm_dest,
                    travel_style=request.travel_style,
                    budget=request.budget,
                    interests=request.interests,
                )
        except Exception as e:
            logger.error(f"Auto-fetch failed for '{norm_dest}': {e}", exc_info=True)

    if not chunks:
        logger.warning(f"No travel guide data could be retrieved or fetched for '{norm_dest}'.")
        raise HTTPException(
            status_code=404,
            detail=(
                f"No travel guide data found for '{norm_dest}'. "
                "The destination might not have a comprehensive Wikipedia/Wikivoyage page, "
                "or your API key quota was exceeded."
            ),
        )

    context = format_context_for_llm(chunks)
    logger.info(f"Formatted {len(chunks)} chunks for LLM context grounding.")

    # Step 3: LLM generation
    try:
        logger.info(f"Calling Gemini 1.5 to generate structured itinerary...")
        itinerary = await generate_itinerary(request, context, weather)
        itinerary.destination = norm_dest  # Ensure canonical destination name in response
        logger.info(f"Successfully generated {len(itinerary.days)}-day itinerary for {norm_dest}.")
    except Exception as e:
        logger.error(f"LLM itinerary generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Itinerary generation error: {str(e)}")

    return itinerary
