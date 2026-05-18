import { motion } from "framer-motion";
import type { ActivitySlot as ActivitySlotType } from "../../types/itinerary";
import SourceBadge from "./SourceBadge";

const TIME_CONFIG = {
  Morning:   { icon: "🌅", color: "from-amber-400 to-orange-400",  bg: "bg-amber-50 dark:bg-amber-900/10"  },
  Afternoon: { icon: "☀️",  color: "from-yellow-400 to-amber-400", bg: "bg-yellow-50 dark:bg-yellow-900/10" },
  Evening:   { icon: "🌙", color: "from-indigo-400 to-purple-500", bg: "bg-indigo-50 dark:bg-indigo-900/10" },
};

const CATEGORY_COLORS: Record<string, string> = {
  Museum:      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  Restaurant:  "bg-rose-100  dark:bg-rose-900/30  text-rose-700  dark:text-rose-300",
  Outdoor:     "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  Landmark:    "bg-blue-100  dark:bg-blue-900/30  text-blue-700  dark:text-blue-300",
  Shopping:    "bg-pink-100  dark:bg-pink-900/30  text-pink-700  dark:text-pink-300",
  Nightlife:   "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
  Relaxation:  "bg-teal-100  dark:bg-teal-900/30  text-teal-700  dark:text-teal-300",
  Adventure:   "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  Sightseeing: "bg-sky-100   dark:bg-sky-900/30   text-sky-700   dark:text-sky-300",
};

interface Props {
  slot: ActivitySlotType;
  index: number;
}

export default function ActivitySlot({ slot, index }: Props) {
  const cfg = TIME_CONFIG[slot.time] ?? TIME_CONFIG.Morning;
  const catColor = CATEGORY_COLORS[slot.category] ?? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300";

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex gap-4 group"
    >
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shadow-md text-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
          {cfg.icon}
        </div>
        {index < 2 && <div className="w-0.5 flex-1 bg-slate-100 dark:bg-slate-700 mt-2 mb-0 min-h-[24px]" />}
      </div>

      {/* Card */}
      <div className={`flex-1 card p-4 mb-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${cfg.bg} border-0`}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              {slot.time}
            </span>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5 leading-snug">
              {slot.activity_name}
            </h4>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {slot.is_indoor !== undefined && (
              <span className="badge text-xs bg-white/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                {slot.is_indoor ? "🏛 Indoor" : "🌿 Outdoor"}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
          {slot.description}
        </p>

        {/* Weather note */}
        {slot.weather_note && (
          <div className="flex items-start gap-1.5 mb-3 p-2 rounded-lg bg-white/50 dark:bg-slate-700/30">
            <span className="text-xs">🌡️</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">{slot.weather_note}</p>
          </div>
        )}

        {/* Footer: category + source */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge text-xs ${catColor}`}>{slot.category}</span>
          <SourceBadge source={slot.source_document} />
        </div>
      </div>
    </motion.div>
  );
}
