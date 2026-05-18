from pydantic import BaseModel
from typing import List


class WeatherDay(BaseModel):
    date: str
    weather_code: int
    weather_label: str
    temperature_max: float
    temperature_min: float
    rain_probability: int
    is_rainy: bool


class WeatherForecast(BaseModel):
    city: str
    latitude: float
    longitude: float
    days: List[WeatherDay]
    summary: str
