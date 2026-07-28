import axios from "axios";
import toast from "react-hot-toast";

// ═══════════════════════════════════════════════════════════════════
//  AXIOS INSTANCE
// ═══════════════════════════════════════════════════════════════════
export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 30000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("nt_token");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    } else if (error.response?.status >= 500) {
      toast.error("Server error. Please try again later.");
    } else if (!error.response) {
      toast.error("Cannot connect to server. Is the backend running?");
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════════
//  AUTH API
// ═══════════════════════════════════════════════════════════════════
export async function loginUser(email, password) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function registerUser(name, email, password) {
  const res = await api.post("/auth/register", { name, email, password });
  return res.data;
}

export async function getMe(token) {
  const res = await api.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// ═══════════════════════════════════════════════════════════════════
//  PREDICT API
// ═══════════════════════════════════════════════════════════════════
export async function predictFood(imageFile) {
  const formData = new FormData();
  formData.append("file", imageFile);
  const res = await api.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
  return res.data;
}

// ═══════════════════════════════════════════════════════════════════
//  USER DATA API
// ═══════════════════════════════════════════════════════════════════
export async function saveMeal(mealData) {
  const res = await api.post("/user/meal", mealData);
  return res.data;
}

export async function getMealHistory(days = 30) {
  const res = await api.get(`/user/history?days=${days}`);
  return res.data;
}

export async function getUserStats() {
  const res = await api.get("/user/stats");
  return res.data;
}

// ═══════════════════════════════════════════════════════════════════
//  MODEL API
// ═══════════════════════════════════════════════════════════════════
export async function getModelMetrics() {
  const res = await api.get("/model/metrics");
  return res.data;
}

export async function getModelStatus() {
  const res = await api.get("/model/status");
  return res.data;
}

export async function getHealthCheck() {
  const res = await api.get("/health");
  return res.data;
}