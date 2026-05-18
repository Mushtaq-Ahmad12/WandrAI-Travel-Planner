import { FiAlertTriangle } from "react-icons/fi";
import { motion } from "framer-motion";

export default function RainAlert() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 px-4 py-3 rounded-xl
                 bg-blue-50 dark:bg-blue-900/20
                 border border-blue-200 dark:border-blue-700
                 text-blue-800 dark:text-blue-300 text-sm mb-4"
    >
      <FiAlertTriangle className="flex-shrink-0 mt-0.5 text-blue-500" size={15} />
      <div>
        <p className="font-semibold">Rain expected today</p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
          Activities have been automatically switched to indoor alternatives.
        </p>
      </div>
    </motion.div>
  );
}
