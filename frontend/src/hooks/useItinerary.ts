import { useState, useCallback } from "react";
import { generateItinerary } from "../services/api";
import type { ItineraryRequest, ItineraryResponse } from "../types/itinerary";

interface UseItineraryResult {
  itinerary: ItineraryResponse | null;
  loading: boolean;
  error: string | null;
  generate: (req: ItineraryRequest) => Promise<void>;
  reset: () => void;
}

export function useItinerary(): UseItineraryResult {
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (req: ItineraryRequest) => {
    setLoading(true);
    setError(null);
    setItinerary(null);
    try {
      const result = await generateItinerary(req);
      setItinerary(result);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to generate itinerary. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setItinerary(null);
    setError(null);
    setLoading(false);
  }, []);

  return { itinerary, loading, error, generate, reset };
}
