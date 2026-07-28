import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Sparkles, Upload, BarChart3, Shield, Zap, Brain } from "lucide-react";

const FEATURES = [
  { icon: Brain, title: "AI Food Recognition", desc: "Deep learning model trained on 101 food categories with EfficientNet-B4 architecture." },
  { icon: Zap, title: "Instant Calorie Estimation", desc: "Get accurate calorie estimates per serving within seconds of uploading." },
  { icon: BarChart3, title: "Progress Tracking", desc: "Track your daily nutrition intake with beautiful charts and analytics." },
  { icon: Shield, title: "Secure & Private", desc: "Your data is protected and your food photos stay private." },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-mesh">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" /> Powered by Deep Learning
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight mb-6 leading-tight">
            Know What You Eat
            <span className="block text-brand-600 dark:text-brand-400">With AI Precision</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
            Upload a food photo and instantly get the dish name, calorie count, and nutritional insights — powered by a state-of-the-art EfficientNet-B4 model.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={isAuthenticated ? "/upload" : "/register"} className="btn-primary text-base !py-4 !px-8">
              <Upload className="w-5 h-5" /> Get Started Free
            </Link>
            <Link to="/model" className="btn-secondary text-base !py-4 !px-8">
              <BarChart3 className="w-5 h-5" /> View Model Performance
            </Link>
          </motion.div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-300/20 rounded-full blur-3xl" />
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight mb-3">Why Calorie Tracker?</h2>
          <p className="text-text-muted text-lg max-w-xl mx-auto">A complete AI-powered nutrition tracking solution built for health-conscious people.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              className="card p-6 text-center hover:!shadow-lg group">
              <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-brand py-16">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-extrabold mb-4">Start Tracking Your Nutrition Today</h2>
          <p className="text-white/80 text-lg mb-8">Join thousands of users who trust AI to help them make better food choices.</p>
          <Link to={isAuthenticated ? "/upload" : "/register"} className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <Sparkles className="w-5 h-5" /> Get Started — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-text-muted">
          <p>© {new Date().getFullYear()} Calorie Tracker. Built with EfficientNet-B4 on Food-101 dataset.</p>
        </div>
      </footer>
    </motion.div>
  );
}