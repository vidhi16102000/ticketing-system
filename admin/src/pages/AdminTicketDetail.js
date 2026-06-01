import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

const STATUS_COLORS = {
  "Open":        { bg: "#EFF6FF", text: "#1D4ED8" },
  "In Progress": { bg: "#FFFBEB", text: "#92400E" },
  "Resolved":    { bg: "#F0FDF4", text: "#14532D" },
  "Rejected":    { bg: "#FEF2F2", text: "#991B1B" },
};

export default function AdminTicketDetail() {
  const { id } = useParams();
  const [ticket,   setTicket]   = useState(null);
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [status,   setStatus]   = useState("");
  const [comment,  setComment]  = useState("");
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState("");

  function fetchTicket() {
    api.get(`/tickets/${id}`).then(r => {
      setTicket(r.data.ticket);
      setComments(r.data.comments);
      setStatus(r.data.ticket.status);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => { fetchTicket(); }, [id]);

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      await api.patch(`/admin/tickets/${id}/status`, { status, comment });
      setMsg("Ticket updated successfully!");
      setComment("");
      fetchTicket();
    } catch (err) {
      setMsg("Error: " + (err.response?.data?.message || "Failed"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ color: "#9CA3AF" }}>Loading...</p>;
  if (!ticket) return <p>Ticket not found.</p>;

  const col = STATUS_COLORS[ticket.status] || {};

  return (
    <div>
      <Link to="/tickets" style={styles.back}>← Back to Tickets</Link>

      <div style={styles.grid}>
        {/* Left: ticket info */}
        <div>
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.tno}>{ticket.ticket_no}</span>
              <span style={{ ...styles.badge, background: col.bg, color: col.text }}>{ticket.status}</span>
            </div>
            <h2 style={styles.issue}>{ticket.issue}</h2>
            {[
              ["User",      `${ticket.user_name} (${ticket.user_email})`],
              ["Category",  ticket.category],
              ["Priority",  ticket.priority],
              ["Raised on", new Date(ticket.created_at).toLocaleString()],
              ["Updated",   new Date(ticket.updated_at).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} style={styles.field}>
                <span style={styles.fieldKey}>{k}</span>
                <span style={styles.fieldVal}>{v}</span>
              </div>
            ))}
          </div>

          {/* Comments */}
          <h3 style={styles.sectionTitle}>Comment History</h3>
          {comments.length === 0
            ? <p style={styles.muted}>No comments yet.</p>
            : comments.map(c => (
              <div key={c.id} style={styles.comment}>
                <div style={styles.commentHeader}>
                  <span style={styles.adminName}>🛡️ {c.admin_name}</span>
                  <span style={styles.commentDate}>{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <p style={styles.commentText}>{c.comment}</p>
              </div>
            ))}
        </div>

        {/* Right: update form */}
        <div style={styles.updateCard}>
          <h3 style={styles.updateTitle}>Update Ticket</h3>
          {msg && <div style={{ ...styles.msgBox, background: msg.startsWith("Error") ? "#FEF2F2" : "#F0FDF4", color: msg.startsWith("Error") ? "#991B1B" : "#14532D" }}>{msg}</div>}
          <form onSubmit={handleUpdate}>
            <label style={styles.label}>Status</label>
            <select style={styles.select} value={status} onChange={e => setStatus(e.target.value)}>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Rejected</option>
            </select>
            <label style={styles.label}>Comment (optional)</label>
            <textarea style={styles.textarea} rows={5} placeholder="Add a resolution note or comment..."
              value={comment} onChange={e => setComment(e.target.value)} />
            <button style={{ ...styles.btn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
              {saving ? "Saving..." : "Update Ticket"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  back: { display: "inline-block", marginBottom: 20, color: "#1D4ED8", textDecoration: "none", fontSize: 14 },
  grid: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" },
  card: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "20px", marginBottom: 20 },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  tno: { fontSize: 12, fontWeight: 700, color: "#1D4ED8" },
  badge: { fontSize: 12, padding: "3px 12px", borderRadius: 20, fontWeight: 600 },
  issue: { fontSize: 18, fontWeight: 600, color: "#111827", margin: "0 0 16px" },
  field: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #F9FAFB" },
  fieldKey: { fontSize: 13, color: "#9CA3AF" },
  fieldVal: { fontSize: 13, color: "#111827", fontWeight: 500 },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 10px" },
  muted: { color: "#9CA3AF", fontSize: 13 },
  comment: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "12px 16px", marginBottom: 8 },
  commentHeader: { display: "flex", justifyContent: "space-between", marginBottom: 4 },
  adminName: { fontSize: 13, fontWeight: 600, color: "#374151" },
  commentDate: { fontSize: 11, color: "#9CA3AF" },
  commentText: { fontSize: 13, color: "#374151", margin: 0 },
  updateCard: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 20 },
  updateTitle: { fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 16px" },
  msgBox: { borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 },
  select: { display: "block", width: "100%", padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 13, marginBottom: 14, background: "#fff" },
  textarea: { display: "block", width: "100%", padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 13, marginBottom: 14, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" },
  btn: { width: "100%", padding: "10px", background: "#1D4ED8", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
};
