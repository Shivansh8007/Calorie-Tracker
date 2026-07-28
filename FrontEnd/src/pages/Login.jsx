import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 gradient-mesh">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <LogIn className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-text-primary">Welcome Back</h1>
            <p className="text-sm text-text-muted mt-1">Sign in to your Calorie Tracker account</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="input-field pl-10" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 text-base">
              {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
