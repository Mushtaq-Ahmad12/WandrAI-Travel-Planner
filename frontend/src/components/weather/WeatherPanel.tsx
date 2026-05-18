import type { ItineraryDay } from "../../types/itinerary";
import { getWeatherIcon } from "./WeatherBadge";

interface WeatherPanelProps {
  days: ItineraryDay[];
  destination: string;
  summary: string;
}

export default function WeatherPanel({ days, destination, summary }: WeatherPanelProps) {
  return (
    <div className="card p-5 sticky top-24">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🌤️</span>
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
          Weather Forecast
        </h3>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
        {summary}
      </p>

      <div className="space-y-2">
        {days.map((day) => {
          const icon = getWeatherIcon(day.weather_code ?? 0);
          const dateObj = new Date(day.date + "T00:00:00");
          const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
          const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

          return (
            <div
              key={day.date}
              className={`flex items-center justify-between p-2.5 rounded-xl text-sm transition-all ${
                day.is_rainy
                  ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800"
                  : "bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-none">
                    {dayName}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{dateStr}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {Math.round(day.temperature_max ?? 0)}°
                  <span className="font-normal text-slate-400 text-xs">
                    /{Math.round(day.temperature_min ?? 0)}°
                  </span>
                </p>
                <p className={`text-xs ${day.rain_probability > 50 ? "text-blue-500" : "text-slate-400"}`}>
                  💧 {day.rain_probability}%
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
        <p className="text-xs text-slate-400">
          Powered by{" "}
          <a
            href="https://open-meteo.com"
            target="_blank"
            rel="noreferrer"
            className="text-brand-500 hover:underline"
          >
            Open-Meteo
          </a>
        </p>
      </div>
    </div>
  );
}
