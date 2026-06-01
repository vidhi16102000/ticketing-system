import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin,   setAdmin]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const saved = localStorage.getItem("adminUser");
    if (token && saved) {
      const user = JSON.parse(saved);
      if (user.role === "admin") setAdmin(user);
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.user.role !== "admin")
      throw new Error("Not an admin account");
    localStorage.setItem("adminToken", res.data.token);
    localStorage.setItem("adminUser", JSON.stringify(res.data.user));
    setAdmin(res.data.user);
    return res.data.user;
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    localStorage.clear();
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
