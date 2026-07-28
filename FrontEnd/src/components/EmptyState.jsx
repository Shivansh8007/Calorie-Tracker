import { motion } from "framer-motion";

export default function EmptyState({ icon: Icon, title, description, action, onAction }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-text-muted" />
        </div>
      )}
      <h3 className="text-lg font-bold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>
      {action && <button onClick={onAction} className="btn-primary text-sm">{action}</button>}
    </motion.div>
  );
}
