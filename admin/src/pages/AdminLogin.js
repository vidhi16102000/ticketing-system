import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,  setForm]  = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>🛡️</div>
        <h2 style={styles.title}>Admin Portal</h2>
        <p style={styles.sub}>Ticketing System Management</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Admin Email</label>
          <input style={styles.input} type="email" placeholder="admin@ticketing.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? "Signing in..." : "Sign In as Admin"}
          </button>
        </form>
        <p style={styles.hint}>Default: admin@ticketing.com / admin123</p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1E3A8A", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  card: { background: "#fff", borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 400 },
  icon: { fontSize: 40, textAlign: "center", marginBottom: 12 },
  title: { margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#111827", textAlign: "center" },
  sub: { margin: "0 0 24px", fontSize: 14, color: "#6B7280", textAlign: "center" },
  error: { background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 },
  input: { display: "block", width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, marginBottom: 16, boxSizing: "border-box" },
  btn: { width: "100%", padding: "10px", background: "#1D4ED8", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  hint: { textAlign: "center", fontSize: 11, color: "#9CA3AF", marginTop: 16 },
};
