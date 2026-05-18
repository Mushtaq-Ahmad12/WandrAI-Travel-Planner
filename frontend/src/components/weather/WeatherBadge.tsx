// Weather icon and color mapping for WMO weather codes
export const WMO_ICONS: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "🌨️", 75: "❄️",
  80: "🌦️", 81: "🌧️", 82: "⛈️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

export const getWeatherIcon = (code: number): string =>
  WMO_ICONS[code] ?? "🌡️";

export const getWeatherColor = (isRainy: boolean, code: number): string => {
  if (isRainy) return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700";
  if (code <= 1) return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
  if (code <= 3) return "bg-slate-50 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600";
  return "bg-slate-50 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600";
};

interface WeatherBadgeProps {
  code: number;
  label: string;
  isRainy: boolean;
  size?: "sm" | "md";
}

export default function WeatherBadge({ code, label, isRainy, size = "md" }: WeatherBadgeProps) {
  const icon = getWeatherIcon(code);
  const colors = getWeatherColor(isRainy, code);
  return (
    <span className={`badge border ${colors} ${size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
