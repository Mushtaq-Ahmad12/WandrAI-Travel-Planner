// TypeScript interfaces matching the backend Pydantic models

export interface ActivitySlot {
  time: "Morning" | "Afternoon" | "Evening";
  activity_name: string;
  description: string;
  category: string;
  weather_note: string;
  source_document: string;
  is_indoor: boolean;
}

export interface ItineraryDay {
  day: number;
  date: string;
  weather: string;
  weather_code: number;
  temperature_max: number;
  temperature_min: number;
  rain_probability: number;
  is_rainy: boolean;
  slots: ActivitySlot[];
}

export interface ItineraryResponse {
  destination: string;
  trip_dates: string;
  weather_summary: string;
  travel_style: string;
  budget: string;
  days: ItineraryDay[];
}

export interface ItineraryRequest {
  destination: string;
  start_date: string;
  end_date: string;
  travel_style: "Adventure" | "Cultural" | "Relaxation" | "Food";
  budget: "Low" | "Medium" | "Luxury";
  interests: string[];
}

export interface WeatherDay {
  date: string;
  weather_code: number;
  weather_label: string;
  temperature_max: number;
  temperature_min: number;
  rain_probability: number;
  is_rainy: boolean;
}

export interface WeatherForecast {
  city: string;
  latitude: number;
  longitude: number;
  days: WeatherDay[];
  summary: string;
}

export type TravelStyle = "Adventure" | "Cultural" | "Relaxation" | "Food";
export type BudgetLevel = "Low" | "Medium" | "Luxury";
