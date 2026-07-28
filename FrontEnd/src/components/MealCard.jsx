import { motion } from "framer-motion";
import { Flame, Clock } from "lucide-react";

const MEAL_EMOJI = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍿" };

export default function MealCard({ meal, index = 0 }) {
  const time = new Date(meal.timestamp);
  const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = time.toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center text-xl shrink-0">
        {MEAL_EMOJI[meal.meal_type] || "🍽️"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-text-primary text-sm truncate">{meal.food}</p>
        <p className="text-xs text-text-muted flex items-center gap-1"><Clock className="w-3 h-3" />{dateStr} at {timeStr}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1"><Flame className="w-3.5 h-3.5" />{meal.calories}</p>
        <p className="text-xs text-text-muted">kcal</p>
      </div>
    </motion.div>
  );
}
