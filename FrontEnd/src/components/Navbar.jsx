import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Home, Upload, LayoutDashboard, BarChart3,
  Sun, Moon, LogOut, User, Menu, X, Wifi, WifiOff
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getModelStatus } from "../services/api";

const NAV_LINKS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/upload", label: "Upload Food", icon: Upload },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/model", label: "Model Performance", icon: BarChart3 },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [modelStatus, setModelStatus] = useState("checking");
  const profileRef = useRef(null);

  // Check model status
  useEffect(() => {
    let interval;
    const check = async () => {
      try {
        const data = await getModelStatus();
        setModelStatus(data.status);
      } catch {
        setModelStatus("offline");
      }
    };
    check();
    interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const statusConfig = {
    ready: { color: "bg-emerald-500", pulse: "bg-emerald-400", label: "Model Ready", icon: Wifi },
    training: { color: "bg-amber-500", pulse: "bg-amber-400", label: "Training", icon: Activity },
    offline: { color: "bg-red-500", pulse: "bg-red-400", label: "Offline", icon: WifiOff },
    checking: { color: "bg-slate-400", pulse: "bg-slate-300", label: "Checking...", icon: Activity },
  };

  const status = statusConfig[modelStatus] || statusConfig.checking;

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="gradient-brand text-white p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-text-primary tracking-tight">
                Calorie Tracker
              </h1>
              <p className="text-[11px] text-text-muted font-medium hidden sm:block">
                AI-powered food recognition
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${active
                      ? "text-brand-700 dark:text-brand-300"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-brand-100 dark:bg-brand-900/30 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-text-secondary">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status.pulse} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status.color}`} />
              </span>
              {status.label}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-200"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-xl hover:bg-surface-hover transition-all duration-200"
                >
                  <span className="text-sm font-medium text-text-primary hidden sm:block">
                    {user?.name}
                  </span>
                  <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-surface rounded-xl border border-border shadow-xl p-2 z-50"
                    >
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-sm font-semibold text-text-primary">{user?.name}</p>
                        <p className="text-xs text-text-muted truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => { logout(); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-sm !px-4 !py-2"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border overflow-hidden"
          >
            <div className="p-4 space-y-1 bg-surface">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                      ${active
                        ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
              {/* Mobile Status */}
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-text-muted">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status.pulse} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status.color}`} />
                </span>
                {status.label}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
