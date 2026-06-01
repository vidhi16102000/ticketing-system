import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

const ACTION_ICONS = { LOGIN: "🔑", LOGOUT: "🚪", REGISTER: "✅", TICKET_CREATED: "🎫", TICKET_STATUS_CHANGED: "🔄" };

export default function AdminUserDetail() {
  const { id } = useParams();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("tickets"); // "tickets" | "logs"

  useEffect(() => {
    api.get(`/admin/users/${id}/activity`)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ color: "#9CA3AF" }}>Loading...</p>;
  if (!data?.user) return <p>User not found.</p>;

  const { user, logs, tickets } = data;

  return (
    <div>
      <Link to="/users" style={styles.back}>← Back to Users</Link>

      {/* User card */}
      <div style={styles.userCard}>
        <div style={styles.avatar}>{user.name[0].toUpperCase()}</div>
        <div>
          <div style={styles.userName}>{user.name}</div>
          <div style={styles.userEmail}>{user.email}</div>
        </div>
        <div style={styles.userStats}>
          <div style={styles.stat}><span style={styles.statNum}>{tickets.length}</span><span style={styles.statLabel}>Tickets</span></div>
          <div style={styles.stat}><span style={styles.statNum}>{logs.length}</span><span style={styles.statLabel}>Activities</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {["tickets", "logs"].map(t => (
          <button key={t} style={{ ...styles.tab, borderBottom: tab === t ? "2px solid #1D4ED8" : "2px solid transparent", color: tab === t ? "#1D4ED8" : "#6B7280" }}
            onClick={() => setTab(t)}>
            {t === "tickets" ? "🎫 Ticket History" : "📋 Activity Logs"}
          </button>
        ))}
      </div>

      {/* Tickets tab */}
      {tab === "tickets" && (
        <div style={styles.list}>
          {tickets.length === 0 ? <p style={styles.muted}>No tickets raised.</p> :
            tickets.map(t => {
              const prColor = t.priority === "High" ? "#DC2626" : t.priority === "Medium" ? "#D97706" : "#059669";
              return (
                <Link to={`/tickets/${t.id}`} key={t.id} style={styles.row}>
                  <span style={styles.tno}>{t.ticket_no}</span>
                  <span style={styles.cell}>{t.issue}</span>
                  <span style={styles.cell}>{t.category}</span>
                  <span style={{ ...styles.cell, color: prColor, fontWeight: 600 }}>{t.priority}</span>
                  <span style={styles.cell}>{t.status}</span>
                  <span style={styles.cellMuted}>{new Date(t.created_at).toLocaleDateString()}</span>
                </Link>
              );
            })}
        </div>
      )}

      {/* Logs tab */}
      {tab === "logs" && (
        <div style={styles.logList}>
          {logs.length === 0 ? <p style={styles.muted}>No activity logged.</p> :
            logs.map(l => (
              <div key={l.id} style={styles.logRow}>
                <span style={styles.logIcon}>{ACTION_ICONS[l.action] || "📌"}</span>
                <div style={styles.logContent}>
                  <span style={styles.logAction}>{l.action.replace(/_/g, " ")}</span>
                  {l.description && <span style={styles.logDesc}> — {l.description}</span>}
                </div>
                <span style={styles.logDate}>{new Date(l.created_at).toLocaleString()}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  back: { display: "inline-block", marginBottom: 20, color: "#1D4ED8", textDecoration: "none", fontSize: 14 },
  userCard: { display: "flex", alignItems: "center", gap: 16, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "20px 24px", marginBottom: 24 },
  avatar: { width: 48, height: 48, borderRadius: "50%", background: "#1D4ED8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 },
  userName: { fontSize: 17, fontWeight: 600, color: "#111827" },
  userEmail: { fontSize: 13, color: "#6B7280" },
  userStats: { display: "flex", gap: 24, marginLeft: "auto" },
  stat: { textAlign: "center" },
  statNum: { display: "block", fontSize: 22, fontWeight: 700, color: "#1D4ED8" },
  statLabel: { fontSize: 12, color: "#9CA3AF" },
  tabs: { display: "flex", gap: 0, marginBottom: 16, borderBottom: "1px solid #E5E7EB" },
  tab: { fontSize: 14, padding: "8px 20px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 },
  list: { display: "flex", flexDirection: "column", gap: 6 },
  row: { display: "grid", gridTemplateColumns: "100px 2fr 1fr 80px 120px 100px", gap: 8, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "12px 16px", textDecoration: "none", color: "inherit", fontSize: 13, alignItems: "center" },
  tno: { fontSize: 12, fontWeight: 700, color: "#1D4ED8" },
  cell: { color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  cellMuted: { color: "#9CA3AF", fontSize: 12 },
  logList: { display: "flex", flexDirection: "column", gap: 6 },
  logRow: { display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 16px", fontSize: 13 },
  logIcon: { fontSize: 18 },
  logContent: { flex: 1 },
  logAction: { fontWeight: 600, color: "#111827" },
  logDesc: { color: "#6B7280" },
  logDate: { fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" },
  muted: { color: "#9CA3AF", fontSize: 14, padding: 10 },
};
