from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import date


class ItineraryRequest(BaseModel):
    destination: str = Field(..., description="Destination city name", example="Paris")
    start_date: date = Field(..., description="Trip start date")
    end_date: date = Field(..., description="Trip end date")
    travel_style: str = Field(default="Cultural")
    budget: str = Field(default="Medium")
    interests: List[str] = Field(default=[], description="List of user interests")


class ActivitySlot(BaseModel):
    time: str = Field(default="Morning", description="Morning, Afternoon, or Evening")
    activity_name: str = Field(default="Sightseeing Activity")
    description: str = Field(default="Explore local attractions and landmarks.")
    category: str = Field(default="Sightseeing")
    weather_note: str = Field(default="Suitable for current weather")
    source_document: str = Field(default="Authoritative Travel Guide")
    is_indoor: Optional[bool] = False


class ItineraryDay(BaseModel):
    day: int
    date: str
    weather: str = Field(default="Clear Sky")
    weather_code: Optional[int] = 0
    temperature_max: Optional[float] = 22.0
    temperature_min: Optional[float] = 15.0
    rain_probability: Optional[int] = 0
    is_rainy: Optional[bool] = False
    slots: List[ActivitySlot] = Field(default=[])


class ItineraryResponse(BaseModel):
    destination: str
    trip_dates: str = Field(default="Trip Itinerary")
    weather_summary: str = Field(default="Weather conditions are favorable.")
    travel_style: str = Field(default="Standard")
    budget: str = Field(default="Medium")
    days: List[ItineraryDay] = Field(default=[])
