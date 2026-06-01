import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/tickets?status=Open"),
    ]).then(([s, t]) => {
      setStats(s.data);
      setTickets(t.data.slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "#9CA3AF" }}>Loading dashboard...</p>;

  const statCards = [
    { label: "Total Tickets",  value: stats.total_tickets,    color: "#1D4ED8", bg: "#EFF6FF" },
    { label: "Open",           value: stats.open_tickets,     color: "#D97706", bg: "#FFFBEB" },
    { label: "In Progress",    value: stats.inprogress_tickets,color: "#7C3AED",bg: "#F5F3FF" },
    { label: "Resolved",       value: stats.resolved_tickets, color: "#059669", bg: "#F0FDF4" },
    { label: "Rejected",       value: stats.rejected_tickets, color: "#DC2626", bg: "#FEF2F2" },
    { label: "Total Users",    value: stats.total_users,      color: "#374151", bg: "#F3F4F6" },
    { label: "Urgent (High)",  value: stats.urgent_tickets,   color: "#DC2626", bg: "#FEF2F2" },
  ];

  return (
    <div>
      <h1 style={styles.title}>Dashboard</h1>

      {/* Stats grid */}
      <div style={styles.statsGrid}>
        {statCards.map(s => (
          <div key={s.label} style={{ ...styles.statCard, background: s.bg }}>
            <div style={{ ...styles.statNum, color: s.color }}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent open tickets */}
      <div style={styles.section}>
        <div style={styles.sectionHead}>
          <h2 style={styles.sectionTitle}>Open Tickets</h2>
          <Link to="/tickets" style={styles.viewAll}>View all →</Link>
        </div>
        <div style={styles.table}>
          <div style={styles.tableHead}>
            <span>Ticket</span><span>User</span><span>Issue</span><span>Priority</span><span>Date</span>
          </div>
          {tickets.length === 0
            ? <p style={{ color: "#9CA3AF", padding: 16 }}>No open tickets</p>
            : tickets.map(t => (
              <Link to={`/tickets/${t.id}`} key={t.id} style={styles.tableRow}>
                <span style={styles.ticketNo}>{t.ticket_no}</span>
                <span style={styles.cell}>{t.user_name}</span>
                <span style={styles.cell}>{t.issue}</span>
                <span style={{ ...styles.cell, color: t.priority === "High" ? "#DC2626" : t.priority === "Medium" ? "#D97706" : "#059669", fontWeight: 500 }}>{t.priority}</span>
                <span style={styles.cell}>{new Date(t.created_at).toLocaleDateString()}</span>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  title: { fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 20px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 },
  statCard: { borderRadius: 12, padding: "18px 16px" },
  statNum: { fontSize: 30, fontWeight: 700, marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#6B7280" },
  section: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden" },
  sectionHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #F3F4F6" },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 },
  viewAll: { fontSize: 13, color: "#1D4ED8", textDecoration: "none" },
  table: { display: "flex", flexDirection: "column" },
  tableHead: { display: "grid", gridTemplateColumns: "100px 1fr 2fr 80px 90px", gap: 10, padding: "10px 20px", fontSize: 12, fontWeight: 600, color: "#9CA3AF", background: "#F9FAFB", borderBottom: "1px solid #F3F4F6" },
  tableRow: { display: "grid", gridTemplateColumns: "100px 1fr 2fr 80px 90px", gap: 10, padding: "12px 20px", borderBottom: "1px solid #F9FAFB", textDecoration: "none", color: "inherit", fontSize: 13 },
  ticketNo: { fontSize: 12, fontWeight: 600, color: "#1D4ED8" },
  cell: { color: "#374151", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
};
