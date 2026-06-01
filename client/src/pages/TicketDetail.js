import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

const STATUS_COLORS = {
  "Open":        { bg: "#EFF6FF", text: "#1D4ED8" },
  "In Progress": { bg: "#FFFBEB", text: "#92400E" },
  "Resolved":    { bg: "#F0FDF4", text: "#14532D" },
  "Rejected":    { bg: "#FEF2F2", text: "#991B1B" },
};

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket,   setTicket]   = useState(null);
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get(`/tickets/${id}`).then(r => {
      setTicket(r.data.ticket);
      setComments(r.data.comments);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ color: "#9CA3AF" }}>Loading...</p>;
  if (!ticket) return <p>Ticket not found.</p>;

  const col = STATUS_COLORS[ticket.status] || {};

  return (
    <div>
      <Link to="/my-tickets" style={styles.back}>← Back to My Tickets</Link>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <span style={styles.ticketNo}>{ticket.ticket_no}</span>
            <h2 style={styles.issue}>{ticket.issue}</h2>
          </div>
          <span style={{ ...styles.statusBadge, background: col.bg, color: col.text }}>{ticket.status}</span>
        </div>

        <div style={styles.grid}>
          {[
            ["Category",   ticket.category],
            ["Priority",   ticket.priority],
            ["Raised on",  new Date(ticket.created_at).toLocaleString()],
            ["Last update",new Date(ticket.updated_at).toLocaleString()],
          ].map(([k, v]) => (
            <div key={k} style={styles.field}>
              <div style={styles.fieldLabel}>{k}</div>
              <div style={styles.fieldValue}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments from admin */}
      <h3 style={styles.sectionTitle}>Admin Comments</h3>
      {comments.length === 0 ? (
        <p style={styles.muted}>No comments yet. We'll update you soon.</p>
      ) : (
        <div style={styles.commentList}>
          {comments.map(c => (
            <div key={c.id} style={styles.comment}>
              <div style={styles.commentHeader}>
                <span style={styles.adminName}>🛡️ {c.admin_name}</span>
                <span style={styles.commentDate}>{new Date(c.created_at).toLocaleString()}</span>
              </div>
              <p style={styles.commentText}>{c.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  back: { display: "inline-block", marginBottom: 20, color: "#1D4ED8", textDecoration: "none", fontSize: 14 },
  card: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "20px 24px", marginBottom: 24 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  ticketNo: { fontSize: 12, fontWeight: 600, color: "#1D4ED8", display: "block", marginBottom: 4 },
  issue: { fontSize: 18, fontWeight: 600, color: "#111827", margin: 0 },
  statusBadge: { fontSize: 13, padding: "4px 14px", borderRadius: 20, fontWeight: 600 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" },
  field: {},
  fieldLabel: { fontSize: 12, color: "#9CA3AF", marginBottom: 2 },
  fieldValue: { fontSize: 14, color: "#111827", fontWeight: 500 },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 12px" },
  muted: { color: "#9CA3AF", fontSize: 14 },
  commentList: { display: "flex", flexDirection: "column", gap: 10 },
  comment: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 16px" },
  commentHeader: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  adminName: { fontSize: 13, fontWeight: 600, color: "#374151" },
  commentDate: { fontSize: 12, color: "#9CA3AF" },
  commentText: { fontSize: 14, color: "#374151", margin: 0 },
};
