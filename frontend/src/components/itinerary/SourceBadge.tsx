import { FiBookOpen } from "react-icons/fi";

interface SourceBadgeProps {
  source: string;
}

export default function SourceBadge({ source }: SourceBadgeProps) {
  // Shorten long source names for display
  const display = source.length > 35 ? source.slice(0, 35) + "…" : source;

  return (
    <span
      title={source}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                 bg-emerald-50 dark:bg-emerald-900/20
                 border border-emerald-200 dark:border-emerald-700
                 text-emerald-700 dark:text-emerald-300 text-xs font-medium
                 cursor-default"
    >
      <FiBookOpen size={10} className="flex-shrink-0" />
      {display}
    </span>
  );
}
