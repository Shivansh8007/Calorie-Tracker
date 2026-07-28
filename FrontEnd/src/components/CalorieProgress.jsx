import { motion } from "framer-motion";

export default function CalorieProgress({ current, goal, size = 160 }) {
  const pct = Math.min((current / goal) * 100, 100);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#10b981";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth="10"
          className="stroke-surface-hover" />
        <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth="10"
          stroke={color} strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-3xl font-extrabold text-text-primary">{current}</span>
        <span className="text-xs text-text-muted font-medium">/ {goal} kcal</span>
      </div>
    </div>
  );
}
