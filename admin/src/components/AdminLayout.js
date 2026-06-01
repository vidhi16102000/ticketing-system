import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/tickets",   icon: "🎫", label: "Tickets" },
  { to: "/users",     icon: "👥", label: "Users" },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate("/login"); }

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>🛡️ Admin Portal</div>
        <nav style={styles.nav}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              ...styles.navItem,
              background: isActive ? "#1E40AF" : "transparent",
              color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
            })}>
              <span>{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={styles.adminInfo}>
          <div style={styles.adminName}>{admin?.name}</div>
          <div style={styles.adminRole}>Super Admin</div>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  layout: { display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  sidebar: { width: 220, background: "#1D4ED8", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0 },
  brand: { fontSize: 16, fontWeight: 700, color: "#fff", padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.15)", marginBottom: 12 },
  nav: { display: "flex", flexDirection: "column", gap: 2, padding: "0 12px", flex: 1 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "background 0.15s" },
  adminInfo: { padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.15)" },
  adminName: { fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 },
  adminRole: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 10 },
  logoutBtn: { fontSize: 12, padding: "5px 12px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, background: "transparent", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontFamily: "inherit" },
  main: { flex: 1, background: "#F9FAFB", padding: 28, overflowY: "auto" },
};
