import { motion } from "framer-motion";

export default function GraphCard({ title, subtitle, children, loading, error, onRetry }) {
  if (error) {
    return (
      <div className="card p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="font-bold text-text-primary mb-1">Chart Unavailable</h3>
        <p className="text-sm text-text-muted mb-4">{error}</p>
        {onRetry && <button onClick={onRetry} className="btn-primary text-sm !py-2 !px-4">Retry</button>}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="font-bold text-text-primary">{title}</h3>
        {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-5 min-h-[300px] flex items-center justify-center">
        {loading ? (
          <div className="space-y-3 w-full">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-surface-hover rounded-full animate-shimmer" style={{ width: `${80 - i * 10}%`, backgroundImage: "linear-gradient(90deg, transparent, rgba(0,0,0,0.04), transparent)" }} />
            ))}
          </div>
        ) : children}
      </div>
    </motion.div>
  );
}
