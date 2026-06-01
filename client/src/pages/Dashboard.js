import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const STATUS_COLORS = {
  "Open":        { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "In Progress": { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  "Resolved":    { bg: "#F0FDF4", text: "#14532D", border: "#BBF7D0" },
  "Rejected":    { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/tickets")
      .then(r => { setTickets(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = {
    total:      tickets.length,
    open:       tickets.filter(t => t.status === "Open").length,
    inProgress: tickets.filter(t => t.status === "In Progress").length,
    resolved:   tickets.filter(t => t.status === "Resolved").length,
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>Welcome, {user?.name} 👋</h1>
      <p style={styles.pageSub}>Here's a summary of your support tickets</p>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: "Total Tickets", value: stats.total, color: "#1D4ED8" },
          { label: "Open",          value: stats.open,        color: "#D97706" },
          { label: "In Progress",   value: stats.inProgress,  color: "#7C3AED" },
          { label: "Resolved",      value: stats.resolved,    color: "#059669" },
        ].map(s => (
          <div key={s.label} style={styles.statCard}>
            <div style={{ ...styles.statNum, color: s.color }}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick action */}
      <Link to="/chat" style={styles.raiseBtn}>+ Raise a New Ticket</Link>

      {/* Recent tickets */}
      <h2 style={styles.sectionTitle}>Recent Tickets</h2>
      {loading ? <p style={styles.muted}>Loading...</p> :
        tickets.length === 0 ? (
          <div style={styles.empty}>
            <p>No tickets yet.</p>
            <Link to="/chat" style={styles.link}>Raise your first ticket →</Link>
          </div>
        ) : (
          <div style={styles.ticketList}>
            {tickets.slice(0, 5).map(t => {
              const col = STATUS_COLORS[t.status] || {};
              return (
                <Link to={`/tickets/${t.id}`} key={t.id} style={styles.ticketRow}>
                  <div>
                    <span style={styles.ticketNo}>{t.ticket_no}</span>
                    <span style={styles.ticketIssue}>{t.issue}</span>
                  </div>
                  <div style={styles.ticketMeta}>
                    <span style={styles.category}>{t.category}</span>
                    <span style={{ ...styles.statusBadge, background: col.bg, color: col.text, border: `1px solid ${col.border}` }}>{t.status}</span>
                    <span style={styles.date}>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      {tickets.length > 5 && (
        <Link to="/my-tickets" style={styles.viewAll}>View all tickets →</Link>
      )}
    </div>
  );
}

const styles = {
  pageTitle: { fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 4px" },
  pageSub: { fontSize: 14, color: "#6B7280", margin: "0 0 24px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  statCard: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "18px 20px" },
  statNum: { fontSize: 28, fontWeight: 700, marginBottom: 4 },
  statLabel: { fontSize: 13, color: "#6B7280" },
  raiseBtn: { display: "inline-block", background: "#1D4ED8", color: "#fff", padding: "10px 20px", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600, marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: "#111827", margin: "0 0 12px" },
  muted: { color: "#9CA3AF", fontSize: 14 },
  empty: { textAlign: "center", padding: "40px 0", color: "#6B7280" },
  link: { color: "#1D4ED8", textDecoration: "none", fontWeight: 500 },
  ticketList: { display: "flex", flexDirection: "column", gap: 8 },
  ticketRow: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 16px", textDecoration: "none", color: "inherit" },
  ticketNo: { fontSize: 12, fontWeight: 600, color: "#1D4ED8", marginRight: 10 },
  ticketIssue: { fontSize: 14, color: "#111827" },
  ticketMeta: { display: "flex", alignItems: "center", gap: 10 },
  category: { fontSize: 12, color: "#6B7280", background: "#F3F4F6", padding: "2px 8px", borderRadius: 20 },
  statusBadge: { fontSize: 12, padding: "2px 10px", borderRadius: 20, fontWeight: 500 },
  date: { fontSize: 12, color: "#9CA3AF" },
  viewAll: { display: "block", textAlign: "right", marginTop: 12, color: "#1D4ED8", textDecoration: "none", fontSize: 13 },
};
