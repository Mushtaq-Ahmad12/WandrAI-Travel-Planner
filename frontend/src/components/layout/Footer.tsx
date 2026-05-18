import { FiGlobe, FiGithub } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-ocean-500 flex items-center justify-center">
            <FiGlobe className="text-white text-xs" />
          </div>
          <span className="font-display font-bold text-slate-800 dark:text-white">
            Wandr<span className="text-brand-500">AI</span>
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Powered by OpenAI · Open-Meteo · Wikivoyage · ChromaDB
        </p>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <FiGithub size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
