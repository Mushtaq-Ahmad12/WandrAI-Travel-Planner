"""
LLM Service — uses Gemini 1.5 with structured JSON output to generate
itineraries grounded strictly in retrieved travel guide context.
Includes robust retry logic and automatic JSON markdown cleaning.
"""
import json
import re
import logging
from typing import List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from models.itinerary import ItineraryRequest, ItineraryResponse, ItineraryDay, ActivitySlot
from models.weather import WeatherDay, WeatherForecast

logger = logging.getLogger("wandrai.llm")

SYSTEM_PROMPT = """You are an authoritative, expert AI travel planner. Your sole task is to generate a structured, professional JSON travel itinerary.

CRITICAL GROUNDING RULES — NO EXCEPTIONS:
1. STRICT RETRIEVED CONTEXT: You MUST construct activities ONLY from the provided [RETRIEVED TRAVEL GUIDE CONTEXT].
2. SOURCE ATTRIBUTION: Every single activity slot MUST include the exact source_document name from the retrieved chunk it originated from. Do not leave source_document blank or invent source names.
3. ZERO HALLUCINATION: If a specific restaurant, museum, park, or attraction is NOT in the retrieved context, DO NOT mention it.
4. WEATHER ADAPTABILITY: Pay strict attention to the weather forecast provided for each date.
   - On rainy days (is_rainy: true), you MUST suggest ONLY indoor activities (museums, cafes, galleries, indoor shopping, spas).
   - On sunny or clear days, prioritize outdoor walking tours, parks, gardens, and scenic viewpoints.
5. BUDGET & STYLE: Tailor all descriptions and chosen spots to match the user's specified budget level and travel style.
6. REALISTIC SCHEDULE: Ensure geographical proximity between Morning, Afternoon, Evening slots so the traveler isn't rushing across the city.
7. Output MUST be valid, clean JSON exactly matching the requested schema. Do not include markdown wrappers or conversational text.
"""

def build_user_prompt(
    request: ItineraryRequest,
    context: str,
    weather_days: List[WeatherDay],
) -> str:
    duration = (request.end_date - request.start_date).days + 1
    weather_lines = "\n".join(
        f"  - Date {w.date}: {w.weather_label}, Max {w.temperature_max}°C, "
        f"Min {w.temperature_min}°C, Rain prob {w.rain_probability}%, "
        f"Condition: {'⚠️ RAINY DAY (INDOOR ONLY)' if w.is_rainy else '✅ Clear weather (Outdoor/Indoor)'}"
        for w in weather_days
    )

    return f"""Generate a {duration}-day structured travel itinerary in strict JSON format.

TRIP PROFILE:
- Destination: {request.destination}
- Dates: {request.start_date} to {request.end_date} ({duration} days)
- Travel Style: {request.travel_style}
- Budget: {request.budget}
- Interests: {', '.join(request.interests) if request.interests else 'General sightseeing, landmarks, food'}

WEATHER FORECAST FOR TRIP DATES:
{weather_lines}

[RETRIEVED TRAVEL GUIDE CONTEXT]:
{context}

JSON OUTPUT SPECIFICATION:
Generate exactly {duration} days. Each day must contain exactly 3 slots: Morning, Afternoon, Evening.
Every slot must have: time, activity_name, description, category, weather_note, source_document, is_indoor.
"""

def clean_json_string(raw_str: str) -> str:
    """Robustly remove markdown wrappers like ```json and ``` from LLM response string."""
    s = raw_str.strip()
    s = re.sub(r"^```json\s*", "", s, flags=re.IGNORECASE)
    s = re.sub(r"^```\s*", "", s)
    s = re.sub(r"\s*```$", "", s)
    s = s.strip()
    return s

async def generate_itinerary(
    request: ItineraryRequest,
    context: str,
    weather_forecast: WeatherForecast,
) -> ItineraryResponse:
    """Call Gemini 1.5 with robust retries, markdown cleanup, and strict schema validation."""
    user_prompt = build_user_prompt(request, context, weather_forecast.days)
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.2,
        max_output_tokens=8192,
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("user", "{user_prompt}")
    ])
    
    max_retries = 3
    last_error = None
    response_data: Optional[ItineraryResponse] = None

    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"LLM generation attempt {attempt} for {request.destination}...")
            # Try structured output first
            structured_llm = llm.with_structured_output(ItineraryResponse)
            chain = prompt | structured_llm
            response_data = await chain.ainvoke({"user_prompt": user_prompt})
            if response_data and response_data.days:
                logger.info("Successfully generated structured itinerary.")
                break
        except Exception as e:
            logger.warning(f"Structured LLM failed on attempt {attempt}: {e}. Attempting raw string extraction...")
            last_error = e
            try:
                # Fallback to raw string generation and manual Pydantic parsing
                raw_chain = prompt | llm
                raw_msg = await raw_chain.ainvoke({"user_prompt": user_prompt})
                clean_json = clean_json_string(raw_msg.content)
                response_data = ItineraryResponse.model_validate_json(clean_json)
                if response_data and response_data.days:
                    logger.info("Successfully recovered JSON via raw string cleanup.")
                    break
            except Exception as ex:
                logger.error(f"Raw string fallback failed on attempt {attempt}: {ex}")
                last_error = ex

    if not response_data or not response_data.days:
        raise ValueError(f"Failed to generate valid JSON itinerary after {max_retries} attempts. Last error: {last_error}")

    # Inject authoritative weather data from Open-Meteo (override LLM weather)
    weather_map = {w.date: w for w in weather_forecast.days}
    for day in response_data.days:
        date_str = day.date
        if date_str in weather_map:
            w = weather_map[date_str]
            day.weather_code = w.weather_code
            day.temperature_max = w.temperature_max
            day.temperature_min = w.temperature_min
            day.rain_probability = w.rain_probability
            day.is_rainy = w.is_rainy
            day.weather = w.weather_label

    response_data.weather_summary = weather_forecast.summary
    return response_data
