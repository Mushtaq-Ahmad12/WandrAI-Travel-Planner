import { motion } from "framer-motion";

const TIPS = [
  "Fetching real weather forecasts from Open-Meteo...",
  "Searching Wikivoyage travel guides...",
  "Retrieving relevant activities from vector database...",
  "Matching activities to your travel style...",
  "Checking weather for each day...",
  "Generating your personalized itinerary with GPT-4o...",
  "Almost ready! Finalizing your day-by-day plan...",
];

export default function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 px-4">
      {/* Animated plane */}
      <motion.div
        className="text-6xl mb-8 select-none"
        animate={{ x: [-20, 20, -20], y: [-5, 5, -5], rotate: [-5, 5, -5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        ✈️
      </motion.div>

      {/* Pulsing rings */}
      <div className="relative mb-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-brand-400/40"
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
            style={{ width: 60, height: 60, left: "50%", top: "50%", marginLeft: -30, marginTop: -30 }}
          />
        ))}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-ocean-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
          <span className="text-xl">🗺️</span>
        </div>
      </div>

      {/* Title */}
      <motion.h2
        className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-3 text-center"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Crafting Your Perfect Itinerary
      </motion.h2>

      {/* Cycling tips */}
      <motion.div className="text-center max-w-sm">
        {TIPS.map((tip, i) => (
          <motion.p
            key={i}
            className="text-sm text-slate-500 dark:text-slate-400 absolute left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -8] }}
            transition={{
              duration: 3,
              delay: i * 3,
              repeat: Infinity,
              repeatDelay: (TIPS.length - 1) * 3,
            }}
          >
            {tip}
          </motion.p>
        ))}
        <div className="h-6" />
      </motion.div>

      {/* Progress bar */}
      <div className="mt-8 w-64 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-500 to-ocean-500 rounded-full"
          animate={{ width: ["0%", "90%"] }}
          transition={{ duration: 25, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-3">This may take 20–30 seconds</p>
    </div>
  );
}
