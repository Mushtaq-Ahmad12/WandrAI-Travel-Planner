import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiMapPin, FiCalendar, FiStar, FiDollarSign, FiZap } from "react-icons/fi";
import type { ItineraryRequest, TravelStyle, BudgetLevel } from "../../types/itinerary";
import { getDestinations } from "../../services/api";

const TRAVEL_STYLES: { value: TravelStyle; label: string; icon: string; desc: string }[] = [
  { value: "Cultural",   label: "Cultural",   icon: "🏛️", desc: "Museums & history" },
  { value: "Adventure",  label: "Adventure",  icon: "🏔️", desc: "Outdoor & thrills"  },
  { value: "Relaxation", label: "Relaxation", icon: "🧘", desc: "Wellness & peace"   },
  { value: "Food",       label: "Food",       icon: "🍜", desc: "Dining & markets"   },
];

const BUDGETS: { value: BudgetLevel; label: string; icon: string }[] = [
  { value: "Low",    label: "Budget",  icon: "💸" },
  { value: "Medium", label: "Mid-Range", icon: "💳" },
  { value: "Luxury", label: "Luxury",  icon: "💎" },
];

const INTEREST_OPTIONS = [
  "Art", "Architecture", "Street Food", "Wine & Spirits", "Photography",
  "Hiking", "Beaches", "Nightlife", "Shopping", "History",
  "Nature", "Music", "Sports", "Local Markets", "Cafes",
];

interface Props {
  onSubmit: (req: ItineraryRequest) => void;
  loading: boolean;
}

export default function TravelForm({ onSubmit, loading }: Props) {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [style, setStyle] = useState<TravelStyle>("Cultural");
  const [budget, setBudget] = useState<BudgetLevel>("Medium");
  const [interests, setInterests] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load available destinations on mount
  useEffect(() => {
    getDestinations().then(setAvailableCities).catch(() => {});
  }, []);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!destination.trim()) errs.destination = "Please enter a destination.";
    if (!startDate) errs.startDate = "Please select a start date.";
    if (!endDate) errs.endDate = "Please select an end date.";
    if (startDate && endDate && endDate < startDate) errs.endDate = "End date must be after start date.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      destination: destination.trim(),
      start_date: startDate,
      end_date: endDate,
      travel_style: style,
      budget,
      interests,
    });
  };

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card p-6 md:p-8 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-ocean-500 flex items-center justify-center">
          <FiZap className="text-white text-sm" />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          Plan Your Trip
        </h2>
      </div>

      {/* Destination */}
      <div className="mb-5">
        <label className="label">
          <FiMapPin className="inline mr-1.5 text-brand-500" size={13} />
          Destination City
        </label>
        <input
          id="destination-input"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Paris, Tokyo, New York City"
          list="city-suggestions"
          className="input-field"
        />
        <datalist id="city-suggestions">
          {availableCities.map((c) => <option key={c} value={c} />)}
        </datalist>
        {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}
        {availableCities.length > 0 && (
          <p className="text-xs text-slate-400 mt-1">
            Available cities: {availableCities.join(", ")}
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="label">
            <FiCalendar className="inline mr-1.5 text-brand-500" size={13} />
            Start Date
          </label>
          <input
            id="start-date-input"
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
          />
          {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
        </div>
        <div>
          <label className="label">
            <FiCalendar className="inline mr-1.5 text-brand-500" size={13} />
            End Date
          </label>
          <input
            id="end-date-input"
            type="date"
            value={endDate}
            min={startDate || today}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
          />
          {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
        </div>
      </div>

      {/* Travel Style */}
      <div className="mb-5">
        <label className="label">
          <FiStar className="inline mr-1.5 text-brand-500" size={13} />
          Travel Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TRAVEL_STYLES.map(({ value, label, icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStyle(value)}
              className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                style === value
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : "border-slate-200 dark:border-slate-600 hover:border-brand-300 dark:hover:border-brand-600"
              }`}
            >
              <div className="text-xl mb-1">{icon}</div>
              <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">{label}</div>
              <div className="text-xs text-slate-400">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="mb-5">
        <label className="label">
          <FiDollarSign className="inline mr-1.5 text-brand-500" size={13} />
          Budget Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {BUDGETS.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setBudget(value)}
              className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                budget === value
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : "border-slate-200 dark:border-slate-600 hover:border-brand-300 dark:hover:border-brand-600"
              }`}
            >
              <div className="text-xl mb-0.5">{icon}</div>
              <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="mb-6">
        <label className="label">Interests (optional)</label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                interests.includes(interest)
                  ? "bg-brand-500 border-brand-500 text-white"
                  : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-brand-400 dark:hover:border-brand-500"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        id="generate-itinerary-btn"
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Generating...
          </>
        ) : (
          <>✈️ Generate My Itinerary</>
        )}
      </button>
    </motion.form>
  );
}
