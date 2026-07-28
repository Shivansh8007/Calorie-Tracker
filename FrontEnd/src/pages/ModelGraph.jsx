import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Brain, Cpu, Database, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getModelMetrics, getModelStatus } from "../services/api";
import GraphCard from "../components/GraphCard";

const CHART_TYPES = [
  { id: "accuracy", label: "Top-1 Accuracy", trainKey: "train_acc", valKey: "val_acc", format: (v) => `${(v * 100).toFixed(1)}%`, multiplier: 100 },
  { id: "loss", label: "Loss", trainKey: "train_loss", valKey: "val_loss", format: (v) => v.toFixed(3), multiplier: 1 },
  { id: "top5", label: "Top-5 Accuracy", trainKey: "train_top5", valKey: "val_top5", format: (v) => `${(v * 100).toFixed(1)}%`, multiplier: 100 },
];

const CustomTooltip = ({ active, payload, label, chartType }) => {
  if (!active || !payload?.length) return null;
  const cfg = CHART_TYPES.find((c) => c.id === chartType);
  return (
    <div className="bg-surface border border-border rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-text-primary mb-1">Epoch {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {cfg ? cfg.format(p.value / (cfg.multiplier || 1)) : p.value}</p>
      ))}
    </div>
  );
};

export default function ModelGraph() {
  const [selectedChart, setSelectedChart] = useState("accuracy");
  const [metrics, setMetrics] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, s] = await Promise.all([getModelMetrics(), getModelStatus()]);
      setMetrics(m);
      setModelInfo(s);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load model metrics");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const chartCfg = CHART_TYPES.find((c) => c.id === selectedChart);
  const chartData = metrics?.epochs?.map((e) => ({
    epoch: e.epoch,
    Train: (e[chartCfg.trainKey] || 0) * (chartCfg.multiplier || 1),
    Validation: (e[chartCfg.valKey] || 0) * (chartCfg.multiplier || 1),
  })) || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Model Performance</h1>
          <p className="text-text-muted mt-1">Training metrics and evaluation curves</p>
        </div>
        <button onClick={fetchData} className="btn-secondary text-sm"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>

      {/* Model Info Cards */}
      {modelInfo && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Brain, label: "Architecture", value: modelInfo.architecture || "—" },
            { icon: Database, label: "Dataset", value: modelInfo.dataset || "—" },
            { icon: Cpu, label: "GPU", value: modelInfo.gpu || "—" },
            { icon: BarChart3, label: "Classes", value: modelInfo.num_classes || "—" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card p-4 flex items-center gap-3 !shadow-none">
              <item.icon className="w-5 h-5 text-brand-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-text-muted">{item.label}</p>
                <p className="text-sm font-semibold text-text-primary truncate">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {metrics?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Best Val Acc", value: `${(metrics.summary.best_val_acc * 100).toFixed(1)}%` },
            { label: "Best Top-5 Acc", value: `${(metrics.summary.best_val_top5 * 100).toFixed(1)}%` },
            { label: "Final Train Loss", value: metrics.summary.final_train_loss.toFixed(3) },
            { label: "Total Epochs", value: metrics.total_epochs },
          ].map((item, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-extrabold text-text-primary">{item.value}</p>
              <p className="text-xs text-text-muted mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart Selector + Chart */}
      <div>
        <div className="flex flex-wrap gap-2 mb-6">
          {CHART_TYPES.map((ct) => (
            <button key={ct.id} onClick={() => setSelectedChart(ct.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedChart === ct.id
                  ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 ring-1 ring-brand-300 dark:ring-brand-700"
                  : "bg-surface border border-border text-text-secondary hover:bg-surface-hover"
              }`}>
              {ct.label}
            </button>
          ))}
        </div>

        <GraphCard title={chartCfg.label} subtitle={`Train vs Validation over ${metrics?.total_epochs || 0} epochs`}
          loading={loading} error={error} onRetry={fetchData}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="epoch" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip chartType={selectedChart} />} />
              <Legend wrapperStyle={{ fontSize: "13px" }} />
              <Line type="monotone" dataKey="Train" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="Validation" stroke="#f43f5e" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </GraphCard>
      </div>
    </motion.div>
  );
}
