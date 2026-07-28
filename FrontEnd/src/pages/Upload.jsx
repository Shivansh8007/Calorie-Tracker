import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { predictFood } from "../services/api";
import UploadZone from "../components/UploadZone";
import Loader from "../components/Loader";
import PredictionResult from "../components/PredictionResult";
import toast from "react-hot-toast";

export default function Upload() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelect = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await predictFood(file);
      setResult(data);
      toast.success(`Identified: ${data.food}`);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to analyze image. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[calc(100vh-4rem)] gradient-mesh">
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
            className="w-14 h-14 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">Analyze Your Meal</h1>
          <p className="text-text-muted text-lg max-w-md mx-auto">Upload a food image and let our AI identify it and estimate nutritional content.</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6 text-center text-sm flex items-center justify-center gap-2">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline font-medium">Dismiss</button>
          </motion.div>
        )}

        <div className="transition-all duration-500">
          {loading ? (
            <Loader />
          ) : result ? (
            <PredictionResult result={result} onReset={() => setResult(null)} />
          ) : (
            <UploadZone onImageSelect={handleImageSelect} />
          )}
        </div>
      </div>
    </motion.div>
  );
}
