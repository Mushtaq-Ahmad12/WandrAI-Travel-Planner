import axios from "axios";
import type { ItineraryRequest, ItineraryResponse, WeatherForecast } from "../types/itinerary";

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return "http://localhost:8000/api";
  return envUrl.endsWith("/api") ? envUrl : `${envUrl.replace(/\/$/, "")}/api`;
};

const API = axios.create({
  baseURL: getBaseUrl(),
  headers: { "Content-Type": "application/json" },
  timeout: 120000, // 2 min — LLM + RAG can take time
});

export const generateItinerary = async (
  request: ItineraryRequest
): Promise<ItineraryResponse> => {
  const { data } = await API.post<ItineraryResponse>("/generate-itinerary", request);
  return data;
};

export const getWeather = async (
  city: string,
  startDate: string,
  endDate: string
): Promise<WeatherForecast> => {
  const { data } = await API.get<WeatherForecast>("/weather", {
    params: { city, start_date: startDate, end_date: endDate },
  });
  return data;
};

export const getDestinations = async (): Promise<string[]> => {
  const { data } = await API.get<{ destinations: string[] }>("/destinations");
  return data.destinations;
};

export const uploadGuide = async (file: File, city: string): Promise<{ chunks_stored: number }> => {
  const form = new FormData();
  form.append("file", file);
  form.append("city", city);
  const { data } = await API.post("/upload-guides", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export default API;
