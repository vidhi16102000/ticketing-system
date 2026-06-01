import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const STATUS_COLORS = {
  "Open":        { bg: "#EFF6FF", text: "#1D4ED8" },
  "In Progress": { bg: "#FFFBEB", text: "#92400E" },
  "Resolved":    { bg: "#F0FDF4", text: "#14532D" },
  "Rejected":    { bg: "#FEF2F2", text: "#991B1B" },
};

export default function AdminTickets() {
  const [tickets,  setTickets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [status,   setStatus]   = useState("");
  const [priority, setPriority] = useState("");
  const [search,   setSearch]   = useState("");

  function fetchTickets() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status)   params.append("status",   status);
    if (priority) params.append("priority", priority);
    if (search)   params.append("search",   search);
    api.get(`/admin/tickets?${params}`)
      .then(r => { setTickets(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { fetchTickets(); }, [status, priority]);

  function handleSearch(e) { e.preventDefault(); fetchTickets(); }

  return (
    <div>
      <h1 style={styles.title}>All Tickets</h1>

      {/* Filters */}
      <div style={styles.filters}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input style={styles.searchInput} placeholder="Search ticket no, user, issue..." value={search}
            onChange={e => setSearch(e.target.value)} />
          <button type="submit" style={styles.searchBtn}>Search</button>
        </form>
        <select style={styles.select} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option>Open</option><option>In Progress</option>
          <option>Resolved</option><option>Rejected</option>
        </select>
        <select style={styles.select} value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="">All Priority</option>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        <div style={styles.thead}>
          <span>Ticket No</span><span>User</span><span>Issue</span>
          <span>Category</span><span>Priority</span><span>Status</span><span>Date</span>
        </div>
        {loading ? <p style={styles.muted}>Loading...</p> :
          tickets.length === 0 ? <p style={styles.muted}>No tickets found.</p> :
          tickets.map(t => {
            const col = STATUS_COLORS[t.status] || {};
            const prColor = t.priority === "High" ? "#DC2626" : t.priority === "Medium" ? "#D97706" : "#059669";
            return (
              <Link to={`/tickets/${t.id}`} key={t.id} style={styles.trow}>
                <span style={styles.tno}>{t.ticket_no}</span>
                <span style={styles.tcell}>{t.user_name}</span>
                <span style={styles.tcell}>{t.issue}</span>
                <span style={styles.tcell}>{t.category}</span>
                <span style={{ ...styles.tcell, color: prColor, fontWeight: 600 }}>{t.priority}</span>
                <span><span style={{ ...styles.badge, background: col.bg, color: col.text }}>{t.status}</span></span>
                <span style={styles.tcell}>{new Date(t.created_at).toLocaleDateString()}</span>
              </Link>
            );
          })}
      </div>
    </div>
  );
}

const styles = {
  title: { fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 20px" },
  filters: { display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" },
  searchForm: { display: "flex", gap: 6, flex: 1, minWidth: 250 },
  searchInput: { flex: 1, padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 13 },
  searchBtn: { padding: "8px 16px", background: "#1D4ED8", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" },
  select: { padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 13, background: "#fff" },
  tableWrap: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden" },
  thead: { display: "grid", gridTemplateColumns: "100px 1fr 2fr 1fr 80px 110px 90px", gap: 8, padding: "10px 18px", fontSize: 12, fontWeight: 600, color: "#9CA3AF", background: "#F9FAFB", borderBottom: "1px solid #F3F4F6" },
  trow: { display: "grid", gridTemplateColumns: "100px 1fr 2fr 1fr 80px 110px 90px", gap: 8, padding: "12px 18px", borderBottom: "1px solid #F9FAFB", textDecoration: "none", color: "inherit", fontSize: 13, alignItems: "center" },
  tno: { fontSize: 12, fontWeight: 600, color: "#1D4ED8" },
  tcell: { color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  badge: { fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  muted: { padding: 20, color: "#9CA3AF", fontSize: 14 },
};
