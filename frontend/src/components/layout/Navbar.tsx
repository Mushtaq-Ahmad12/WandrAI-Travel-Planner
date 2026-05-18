import { Link, useNavigate } from "react-router-dom";
import { FiMap, FiGlobe } from "react-icons/fi";
import { useTheme } from "../../hooks/useTheme";

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 dark:border-slate-700/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-ocean-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <FiGlobe className="text-white text-sm" />
          </div>
          <span className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Wandr<span className="text-brand-500">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Home
          </Link>
          <button
            onClick={() => navigate("/")}
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            Plan a Trip
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="btn-primary py-2 px-4 text-sm hidden sm:flex items-center gap-1.5"
          >
            <FiMap className="text-sm" />
            Plan Trip
          </button>
        </div>
      </div>
    </nav>
  );
}
