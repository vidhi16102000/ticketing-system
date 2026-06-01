import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const STATUS_OPTS = ["All", "Open", "In Progress", "Resolved", "Rejected"];
const STATUS_COLORS = {
  "Open":        { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "In Progress": { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  "Resolved":    { bg: "#F0FDF4", text: "#14532D", border: "#BBF7D0" },
  "Rejected":    { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" },
};
const PRIORITY_COLORS = { High: "#DC2626", Medium: "#D97706", Low: "#059669" };

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [filter,  setFilter]  = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/tickets")
      .then(r => { setTickets(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "All" ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div>
      <h1 style={styles.title}>My Tickets</h1>

      {/* Filter pills */}
      <div style={styles.filters}>
        {STATUS_OPTS.map(s => (
          <button key={s} style={{ ...styles.pill, background: filter === s ? "#1D4ED8" : "#fff", color: filter === s ? "#fff" : "#374151", border: `1px solid ${filter === s ? "#1D4ED8" : "#D1D5DB"}` }}
            onClick={() => setFilter(s)}>{s}
          </button>
        ))}
        <Link to="/chat" style={styles.raiseBtn}>+ New Ticket</Link>
      </div>

      {loading ? <p style={styles.muted}>Loading...</p> :
        filtered.length === 0 ? (
          <div style={styles.empty}><p>No tickets found.</p></div>
        ) : (
          <div style={styles.list}>
            {filtered.map(t => {
              const col = STATUS_COLORS[t.status] || {};
              return (
                <Link to={`/tickets/${t.id}`} key={t.id} style={styles.row}>
                  <div style={styles.rowTop}>
                    <span style={styles.ticketNo}>{t.ticket_no}</span>
                    <span style={{ ...styles.badge, background: col.bg, color: col.text, border: `1px solid ${col.border}` }}>{t.status}</span>
                  </div>
                  <div style={styles.issue}>{t.issue}</div>
                  <div style={styles.rowBottom}>
                    <span style={styles.catTag}>{t.category}</span>
                    <span style={{ ...styles.priority, color: PRIORITY_COLORS[t.priority] }}>● {t.priority}</span>
                    <span style={styles.date}>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                  {t.last_comment && (
                    <div style={styles.comment}>💬 {t.last_comment}</div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
    </div>
  );
}

const styles = {
  title: { fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 20px" },
  filters: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" },
  pill: { fontSize: 13, padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit" },
  raiseBtn: { marginLeft: "auto", background: "#1D4ED8", color: "#fff", textDecoration: "none", fontSize: 13, padding: "6px 14px", borderRadius: 8, fontWeight: 500 },
  muted: { color: "#9CA3AF", fontSize: 14 },
  empty: { textAlign: "center", padding: "60px 0", color: "#6B7280" },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  row: { display: "block", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "14px 16px", textDecoration: "none", color: "inherit" },
  rowTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  ticketNo: { fontSize: 12, fontWeight: 600, color: "#1D4ED8" },
  badge: { fontSize: 11, padding: "2px 10px", borderRadius: 20, fontWeight: 500 },
  issue: { fontSize: 14, color: "#111827", marginBottom: 8, fontWeight: 500 },
  rowBottom: { display: "flex", gap: 10, alignItems: "center" },
  catTag: { fontSize: 12, color: "#6B7280", background: "#F3F4F6", padding: "2px 8px", borderRadius: 20 },
  priority: { fontSize: 12, fontWeight: 500 },
  date: { fontSize: 12, color: "#9CA3AF", marginLeft: "auto" },
  comment: { marginTop: 8, fontSize: 12, color: "#6B7280", background: "#F9FAFB", padding: "6px 10px", borderRadius: 6 },
};
