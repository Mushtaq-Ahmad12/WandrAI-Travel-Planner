import { motion } from "framer-motion";
import type { ItineraryDay } from "../../types/itinerary";
import ActivitySlot from "./ActivitySlot";
import RainAlert from "./RainAlert";
import WeatherBadge from "../weather/WeatherBadge";

interface Props {
  day: ItineraryDay;
  index: number;
}

export default function DayTimeline({ day, index }: Props) {
  const dateObj = new Date(day.date + "T00:00:00");
  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="mb-10"
    >
      {/* Day header */}
      <div className="flex items-center gap-4 mb-5">
        {/* Day number pill */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-ocean-500 flex flex-col items-center justify-center shadow-lg shadow-brand-500/20 flex-shrink-0">
          <span className="text-white text-xs font-bold leading-none opacity-80">DAY</span>
          <span className="text-white text-lg font-bold leading-none">{day.day}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white leading-tight">
            {dayName}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{dateStr}</p>
        </div>
        {/* Weather badge */}
        <WeatherBadge
          code={day.weather_code ?? 0}
          label={day.weather}
          isRainy={day.is_rainy ?? false}
        />
      </div>

      {/* Rain alert */}
      {day.is_rainy && <RainAlert />}

      {/* Temperature strip */}
      {day.temperature_max != null && (
        <div className="flex items-center gap-4 mb-5 px-1 text-sm text-slate-500 dark:text-slate-400">
          <span>🌡️ {Math.round(day.temperature_max)}° / {Math.round(day.temperature_min ?? 0)}°C</span>
          <span>💧 {day.rain_probability}% rain</span>
        </div>
      )}

      {/* Activity slots */}
      <div className="pl-1">
        {day.slots.map((slot, i) => (
          <ActivitySlot key={`${day.day}-${slot.time}`} slot={slot} index={i} />
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-slate-200 dark:border-slate-700 mt-2" />
    </motion.div>
  );
}
