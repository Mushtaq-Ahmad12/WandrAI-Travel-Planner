import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TravelForm from "../components/form/TravelForm";
import { useItinerary } from "../hooks/useItinerary";
import type { ItineraryRequest } from "../types/itinerary";

const FEATURES = [
  { icon: "🗺️", title: "RAG-Grounded", desc: "Activities sourced from real Wikivoyage travel guides" },
  { icon: "🌦️", title: "Weather-Aware", desc: "Live forecasts with automatic indoor alternatives on rainy days" },
  { icon: "📍", title: "Source-Cited",  desc: "Every activity shows exactly where the info came from" },
  { icon: "⚡", title: "Powered by GPT-4o / Gemini", desc: "Structured, detailed itineraries in seconds" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { generate, loading, error } = useItinerary();

  const handleSubmit = async (req: ItineraryRequest) => {
    const result = await generate(req);
    navigate("/itinerary", { state: { request: req } });
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-[150px] pb-12 px-4">
        {/* Gradient background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-brand-400/20 to-ocean-400/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-sunset-400/15 to-brand-400/15 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 badge bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700 px-4 py-1.5 text-sm mb-6"
          >
            <span className="animate-pulse-slow">✨</span>
            AI-Powered · RAG-Grounded · Real Data
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-5 leading-tight"
          >
            Your Perfect Trip,
            <br />
            <span className="bg-gradient-to-r from-brand-500 via-ocean-500 to-sunset-500 bg-clip-text text-transparent">
              Planned by AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10"
          >
            Enter your destination, travel style, and budget. Get a complete day-by-day itinerary grounded in real travel guides with live weather forecasts.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            {[
              { num: "10+", label: "Cities Covered" },
              { num: "RAG", label: "Grounded Responses" },
              { num: "Live", label: "Weather Data" },
              { num: "Gemini AI", label: "Powered" },
            ].map(({ num, label }) => (
               <div key={label} className="text-center">
                <div className="font-display font-bold text-2xl text-brand-600 dark:text-brand-400">{num}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Form ── */}
      <section id="plan" className="px-4 pb-10 max-w-7xl mx-auto">
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm">
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}
        <TravelForm onSubmit={handleSubmit} loading={loading} />
      </section>

      {/* ── Features ── */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <h2 className="section-title text-center mb-3">Why WandrAI?</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto">
          Not just another AI chatbot — every recommendation is retrieved from real travel guides.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
