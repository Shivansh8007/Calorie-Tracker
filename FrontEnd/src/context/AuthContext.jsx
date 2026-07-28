import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginUser, registerUser, getMe } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("nt_token"));
  const [loading, setLoading] = useState(true);

  // Auto-login: verify existing token on mount
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await getMe(token);
        setUser(userData);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("nt_token");
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginUser(email, password);
    localStorage.setItem("nt_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await registerUser(name, email, password);
    localStorage.setItem("nt_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("nt_token");
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
