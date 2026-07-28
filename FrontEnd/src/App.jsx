import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy loaded pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Upload = lazy(() => import("./pages/Upload"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ModelGraph = lazy(() => import("./pages/ModelGraph"));

function PageLoader() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-surface-alt flex flex-col">
            <Navbar />
            <main className="flex-1">
              <AnimatePresence mode="wait">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/model" element={<ProtectedRoute><ModelGraph /></ProtectedRoute>} />
                  </Routes>
                </Suspense>
              </AnimatePresence>
            </main>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;