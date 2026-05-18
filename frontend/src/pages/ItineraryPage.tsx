import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiMapPin } from "react-icons/fi";
import { useItinerary } from "../hooks/useItinerary";
import type { ItineraryRequest } from "../types/itinerary";
import DayTimeline from "../components/itinerary/DayTimeline";
import WeatherPanel from "../components/weather/WeatherPanel";
import LoadingAnimation from "../components/ui/LoadingAnimation";
import ExportButton from "../components/ui/ExportButton";

export default function ItineraryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { generate, itinerary, loading, error } = useItinerary();
  const hasFetched = useRef(false);

  const request = location.state?.request as ItineraryRequest | undefined;

  useEffect(() => {
    if (!request) {
      navigate("/");
      return;
    }
    if (!hasFetched.current) {
      hasFetched.current = true;
      generate(request);
    }
  }, []);

  if (!request) return null;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors mb-6 mt-4"
        >
          <FiArrowLeft size={14} />
          Back to Planner
        </button>

        {/* Loading state */}
        {loading && <LoadingAnimation />}

        {/* Error state */}
        {error && !loading && (
          <div className="max-w-xl mx-auto text-center py-20">
            <div className="text-5xl mb-4">😕</div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Couldn't Generate Itinerary
            </h2>
            <div className="card p-5 text-left mb-6 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            <button onClick={() => navigate("/")} className="btn-primary">
              Try Again
            </button>
          </div>
        )}

        {/* Itinerary result */}
        {itinerary && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8 print:mb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FiMapPin className="text-brand-500" size={16} />
                    <span className="text-sm font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                      Your AI Itinerary
                    </span>
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-1">
                    {itinerary.destination}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {itinerary.trip_dates} · {itinerary.days.length} Days ·{" "}
                    <span className="font-medium">{itinerary.travel_style}</span> ·{" "}
                    <span className="font-medium">{itinerary.budget} Budget</span>
                  </p>
                </div>
                <div className="print:hidden">
                  <ExportButton itinerary={itinerary} />
                </div>
              </div>

              {/* Weather summary banner */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-brand-50 to-ocean-50 dark:from-brand-900/20 dark:to-ocean-900/20 border border-brand-100 dark:border-brand-800/50">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  🌤️ <strong>Weather Summary:</strong> {itinerary.weather_summary}
                </p>
              </div>

              {/* Source attribution note */}
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/40">
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  📚 <strong>Real Data:</strong> All activities below are retrieved from Wikivoyage travel guides stored in a vector database — not generated from model memory.
                </p>
              </div>
            </div>

            {/* Main layout: timeline + weather panel */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Day-by-day timeline */}
              <div className="flex-1 min-w-0">
                {itinerary.days.map((day, i) => (
                  <DayTimeline key={day.day} day={day} index={i} />
                ))}
              </div>

              {/* Weather sidebar */}
              <div className="w-full lg:w-72 xl:w-80 print:hidden">
                <WeatherPanel
                  days={itinerary.days}
                  destination={itinerary.destination}
                  summary={itinerary.weather_summary}
                />

                {/* Trip summary card */}
                <div className="card p-5 mt-4">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">
                    Trip Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Destination", value: itinerary.destination },
                      { label: "Duration", value: `${itinerary.days.length} days` },
                      { label: "Style", value: itinerary.travel_style },
                      { label: "Budget", value: itinerary.budget },
                      {
                        label: "Rainy Days",
                        value: `${itinerary.days.filter((d) => d.is_rainy).length} of ${itinerary.days.length}`,
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">{label}</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
