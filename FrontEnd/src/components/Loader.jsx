import { motion } from "framer-motion";
import { Loader2, Sparkles, Brain } from "lucide-react";

export default function Loader({ text = "Analyzing image...", subtext = "Identifying food & estimating calories" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-16 card w-full relative overflow-hidden"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated icon stack */}
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-16 h-16 text-brand-500" />
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Brain className="w-7 h-7 text-brand-600" />
          </motion.div>
        </div>

        {/* Animated dots */}
        <div className="flex gap-2 mb-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-brand-400"
              animate={{ y: [-4, 4, -4], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>

        <p className="text-xl font-bold text-text-primary mb-1">{text}</p>
        <p className="text-sm text-text-muted flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {subtext}
        </p>
      </div>
    </motion.div>
  );
}