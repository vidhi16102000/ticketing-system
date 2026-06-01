import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  function fetchUsers() {
    api.get("/admin/users")
      .then(r => { setUsers(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }
  useEffect(() => { fetchUsers(); }, []);

  async function toggleUser(id) {
    await api.patch(`/admin/users/${id}/toggle`);
    fetchUsers();
  }

  return (
    <div>
      <h1 style={styles.title}>Users ({users.length})</h1>
      <div style={styles.tableWrap}>
        <div style={styles.thead}>
          <span>Name</span><span>Email</span><span>Tickets</span>
          <span>Joined</span><span>Last Login</span><span>Status</span><span>Actions</span>
        </div>
        {loading ? <p style={styles.muted}>Loading...</p> :
          users.map(u => (
            <div key={u.id} style={styles.trow}>
              <span style={styles.name}>{u.name}</span>
              <span style={styles.cell}>{u.email}</span>
              <span style={styles.cell}>{u.ticket_count}</span>
              <span style={styles.cell}>{new Date(u.created_at).toLocaleDateString()}</span>
              <span style={styles.cell}>{u.last_login ? new Date(u.last_login).toLocaleDateString() : "Never"}</span>
              <span>
                <span style={{ ...styles.badge, background: u.is_active ? "#F0FDF4" : "#FEF2F2", color: u.is_active ? "#14532D" : "#991B1B" }}>
                  {u.is_active ? "Active" : "Inactive"}
                </span>
              </span>
              <span style={styles.actions}>
                <Link to={`/users/${u.id}`} style={styles.viewBtn}>View</Link>
                <button style={{ ...styles.toggleBtn, background: u.is_active ? "#FEF2F2" : "#F0FDF4", color: u.is_active ? "#991B1B" : "#14532D" }}
                  onClick={() => toggleUser(u.id)}>
                  {u.is_active ? "Disable" : "Enable"}
                </button>
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

const styles = {
  title: { fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 20px" },
  tableWrap: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden" },
  thead: { display: "grid", gridTemplateColumns: "1fr 1.5fr 70px 90px 90px 80px 120px", gap: 8, padding: "10px 18px", fontSize: 12, fontWeight: 600, color: "#9CA3AF", background: "#F9FAFB", borderBottom: "1px solid #F3F4F6" },
  trow: { display: "grid", gridTemplateColumns: "1fr 1.5fr 70px 90px 90px 80px 120px", gap: 8, padding: "12px 18px", borderBottom: "1px solid #F9FAFB", fontSize: 13, alignItems: "center" },
  name: { fontWeight: 500, color: "#111827" },
  cell: { color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  badge: { fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500 },
  actions: { display: "flex", gap: 6 },
  viewBtn: { fontSize: 11, padding: "4px 10px", background: "#EFF6FF", color: "#1D4ED8", borderRadius: 6, textDecoration: "none", fontWeight: 500 },
  toggleBtn: { fontSize: 11, padding: "4px 10px", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500, fontFamily: "inherit" },
  muted: { padding: 20, color: "#9CA3AF", fontSize: 14 },
};
