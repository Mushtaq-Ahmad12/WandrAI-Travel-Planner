"""
GET /api/weather — fetch raw weather forecast for a city and date range
"""
import logging
from fastapi import APIRouter, HTTPException, Query
from datetime import date
from services.weather_service import get_weather_forecast
from services.destination_service import normalize_destination
from models.weather import WeatherForecast

logger = logging.getLogger("wandrai.weather_route")
router = APIRouter()

@router.get("/weather", response_model=WeatherForecast)
async def get_weather(
    city: str = Query(..., description="City name (e.g. Paris)"),
    start_date: date = Query(..., description="Start date YYYY-MM-DD"),
    end_date: date = Query(..., description="End date YYYY-MM-DD"),
):
    """Return real weather forecast from Open-Meteo for the normalized city and dates."""
    norm_city = normalize_destination(city)
    logger.info(f"Fetching standalone weather forecast for '{norm_city}' ({start_date} to {end_date})")
    try:
        return await get_weather_forecast(norm_city, start_date, end_date)
    except ValueError as e:
        logger.warning(f"Weather request validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Weather service failure: {e}", exc_info=True)
        raise HTTPException(status_code=502, detail=f"Weather service error: {str(e)}")
