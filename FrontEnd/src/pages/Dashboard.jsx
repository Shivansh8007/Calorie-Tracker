import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Flame, TrendingUp, Utensils, Target, Upload } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useAuth } from "../context/AuthContext";
import { getUserStats } from "../services/api";
import StatCard from "../components/StatCard";
import CalorieProgress from "../components/CalorieProgress";
import MealCard from "../components/MealCard";
import EmptyState from "../components/EmptyState";
import SkeletonLoader from "../components/SkeletonLoader";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-text-primary">{label}</p>
      <p className="text-orange-500 font-bold">{payload[0].value} kcal</p>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setStats(await getUserStats());
      } catch { setError("Failed to load dashboard data"); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 space-y-6">
      <div className="h-10 w-64 bg-surface-hover rounded-xl animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><SkeletonLoader count={3} height="h-20" /></div>
      <SkeletonLoader count={1} height="h-80" />
    </div>
  );

  if (error) return (
    <div className="max-w-6xl mx-auto py-12 px-4 text-center">
      <p className="text-red-500 mb-4">{error}</p>
      <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
    </div>
  );

  const goal = stats?.calorie_goal || 2000;
  const todayCals = stats?.today_calories || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-text-muted mt-1">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <Link to="/upload" className="btn-primary"><Upload className="w-4 h-4" />Analyze Food</Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Flame} label="Calories Today" value={todayCals} suffix=" kcal" gradient="gradient-warm" delay={0} />
        <StatCard icon={TrendingUp} label="Weekly Average" value={stats?.weekly_avg || 0} suffix=" kcal" gradient="gradient-brand" delay={0.1} />
        <StatCard icon={Utensils} label="Total Meals Tracked" value={stats?.total_meals || 0} gradient="gradient-success" delay={0.2} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-text-secondary">
            <Target className="w-4 h-4" /> Daily Calorie Goal
          </div>
          <div className="relative">
            <CalorieProgress current={todayCals} goal={goal} />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-text-muted">{Math.max(0, goal - todayCals)} kcal remaining</p>
            <p className="text-xs text-text-muted mt-1">{stats?.today_meals || 0} meals logged today</p>
          </div>
        </motion.div>

        {/* Weekly Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6 lg:col-span-2">
          <h3 className="font-bold text-text-primary mb-1">Weekly Overview</h3>
          <p className="text-sm text-text-muted mb-4">Daily calorie intake for the past 7 days</p>
          {stats?.weekly_data?.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.weekly_data} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-surface-hover)", radius: 8 }} />
                <Bar dataKey="calories" radius={[8, 8, 0, 0]}>
                  {stats.weekly_data.map((entry, i) => (
                    <Cell key={i} fill={entry.calories > goal ? "#ef4444" : entry.calories > goal * 0.7 ? "#f59e0b" : "#10b981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-muted text-sm">No data for this week yet</div>
          )}
        </motion.div>
      </div>

      {/* Recent Meals */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h3 className="font-bold text-text-primary mb-4">Recent Meals</h3>
        {stats?.recent_meals?.length ? (
          <div className="space-y-2">
            {stats.recent_meals.map((meal, i) => (
              <MealCard key={meal.id} meal={meal} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Utensils} title="No meals yet" description="Upload a food image to start tracking your nutrition." action="Upload Food" onAction={() => window.location.href = "/upload"} />
        )}
      </motion.div>
    </motion.div>
  );
}
