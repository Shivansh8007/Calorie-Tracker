import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Utensils, Save, CheckCircle, Sparkles } from "lucide-react";
import { saveMeal } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const MEAL_TYPES = [
  { id: "breakfast", label: "Breakfast", emoji: "🌅" },
  { id: "lunch", label: "Lunch", emoji: "☀️" },
  { id: "dinner", label: "Dinner", emoji: "🌙" },
  { id: "snack", label: "Snack", emoji: "🍿" },
];

function getAiFeedback(food, calories) {
  if (calories > 500) return { text: "This meal is quite high in calories. Consider a lighter portion!", type: "warning" };
  if (calories > 300) return { text: "A balanced meal! Good energy source for your day.", type: "info" };
  return { text: "Light and nutritious! Great choice for mindful eating.", type: "success" };
}

export default function PredictionResult({ result, onReset }) {
  const { isAuthenticated } = useAuth();
  const [mealType, setMealType] = useState("snack");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const confPct = (result.confidence * 100).toFixed(1);
  const feedback = getAiFeedback(result.food, result.calories);

  const handleSave = async () => {
    if (!isAuthenticated) { toast.error("Sign in to save meals"); return; }
    setSaving(true);
    try {
      await saveMeal({ ...result, meal_type: mealType });
      setSaved(true);
      toast.success("Meal saved to your dashboard!");
    } catch { toast.error("Failed to save meal"); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden w-full">
      {/* Header */}
      <div className="gradient-brand p-6 text-center text-white">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-80" />
        </motion.div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-1">{result.food}</h2>
        <p className="text-white/80 text-sm font-medium">Food Identified Successfully</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Confidence Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-secondary font-medium flex items-center gap-1.5"><TrendingUp className="w-4 h-4" />Confidence</span>
            <span className="font-bold text-text-primary">{confPct}%</span>
          </div>
          <div className="h-3 bg-surface-hover rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${confPct}%` }} transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className={`h-full rounded-full ${parseFloat(confPct) > 80 ? "bg-emerald-500" : parseFloat(confPct) > 50 ? "bg-amber-500" : "bg-red-500"}`}
            />
          </div>
        </div>

        {/* Calories Card */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 rounded-xl p-6 text-center border border-orange-200 dark:border-orange-800/30">
          <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-4xl font-extrabold text-orange-600 dark:text-orange-400">{result.calories}<span className="text-xl ml-1">kcal</span></div>
          <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wider mt-1">Estimated per serving ({result.typical_serving_g}g)</p>
        </motion.div>

        {/* AI Feedback */}
        <div className={`flex items-start gap-3 p-3 rounded-xl text-sm ${
          feedback.type === "warning" ? "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300" :
          feedback.type === "success" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300" :
          "bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300"
        }`}>
          <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{feedback.text}</span>
        </div>

        {/* Meal Type Selector */}
        {isAuthenticated && !saved && (
          <div>
            <p className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-1.5"><Utensils className="w-4 h-4" />Tag this meal</p>
            <div className="flex gap-2">
              {MEAL_TYPES.map((mt) => (
                <button key={mt.id} onClick={() => setMealType(mt.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    mealType === mt.id ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 ring-1 ring-brand-300" : "bg-surface-hover text-text-secondary hover:bg-surface"
                  }`}>
                  {mt.emoji} {mt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {isAuthenticated && !saved && (
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 !py-3">
              {saving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Save className="w-4 h-4" /></motion.div> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save to Dashboard"}
            </button>
          )}
          {saved && (
            <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle className="w-5 h-5" />Saved!
            </div>
          )}
          <button onClick={onReset} className="btn-secondary flex-1 !py-3">Analyze Another</button>
        </div>
      </div>
    </motion.div>
  );
}
