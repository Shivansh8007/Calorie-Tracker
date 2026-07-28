import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

function Counter({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());
  useEffect(() => { const ctrl = animate(count, value, { duration: 1.5 }); return ctrl.stop; }, [value]);
  return <motion.span>{rounded}</motion.span>;
}

export default function StatCard({ icon: Icon, label, value, suffix = "", gradient = "gradient-brand", delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shadow-md shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-text-primary"><Counter value={value} />{suffix}</p>
        <p className="text-sm text-text-muted font-medium">{label}</p>
      </div>
    </motion.div>
  );
}
