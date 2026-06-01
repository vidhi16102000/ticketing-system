const { getPool, sql }  = require("../config/db");
const { logActivity }   = require("../utils/logger");
const { LOG_ACTION } = require("../constants/enums");

// ── GET /api/admin/tickets — all tickets with optional filters ─────────────
async function getAllTickets(req, res) {
  const { status, priority, search } = req.query;
  try {
    const pool    = await getPool();
    const request = pool.request();
    let   query   = `
      SELECT t.*, u.name as user_name, u.email as user_email,
        (SELECT TOP 1 comment FROM TicketComments
         WHERE ticket_id = t.id ORDER BY created_at DESC) AS last_comment
      FROM Tickets t
      JOIN Users u ON t.user_id = u.id
      WHERE 1=1
    `;

    if (status) {
      query += " AND t.status = @status";
      request.input("status", sql.NVarChar, status);
    }
    if (priority) {
      query += " AND t.priority = @priority";
      request.input("priority", sql.NVarChar, priority);
    }
    if (search) {
      query += " AND (t.ticket_no LIKE @search OR u.name LIKE @search OR t.issue LIKE @search)";
      request.input("search", sql.NVarChar, `%${search}%`);
    }
    query += " ORDER BY t.created_at DESC";

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ── PATCH /api/admin/tickets/:id/status ───────────────────────────────────
async function updateTicketStatus(req, res) {
  // Status already validated by ticketValidator middleware
  const { status, comment } = req.body;
  try {
    const pool = await getPool();

    await pool.request()
      .input("id",     sql.Int,      req.params.id)
      .input("status", sql.NVarChar, status)
      .query("UPDATE Tickets SET status = @status, updated_at = GETDATE() WHERE id = @id");

    if (comment && comment.trim()) {
      await pool.request()
        .input("ticket_id", sql.Int,      req.params.id)
        .input("admin_id",  sql.Int,      req.user.id)
        .input("comment",   sql.NVarChar, comment.trim())
        .query(`INSERT INTO TicketComments (ticket_id, admin_id, comment)
                VALUES (@ticket_id, @admin_id, @comment)`);
    }

    await logActivity(
      req.user.id,
      LOG_ACTION.TICKET_STATUS_CHANGED,
      `Ticket #${req.params.id} → ${status}`,
      req.ip
    );

    res.json({ message: "Ticket updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ── GET /api/admin/users ───────────────────────────────────────────────────
async function getAllUsers(req, res) {
  try {
    const pool   = await getPool();
    const result = await pool.request().query(`
      SELECT u.id, u.name, u.email, u.role, u.is_active,
             u.created_at, u.last_login,
             COUNT(t.id) as ticket_count
      FROM Users u
      LEFT JOIN Tickets t ON t.user_id = u.id
      WHERE u.role = 'user'
      GROUP BY u.id, u.name, u.email, u.role, u.is_active, u.created_at, u.last_login
      ORDER BY u.created_at DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ── GET /api/admin/users/:id/activity ─────────────────────────────────────
async function getUserActivity(req, res) {
  try {
    const pool = await getPool();

    const [userResult, logsResult, ticketsResult] = await Promise.all([
      pool.request()
        .input("id", sql.Int, req.params.id)
        .query("SELECT id, name, email FROM Users WHERE id = @id"),
      pool.request()
        .input("user_id", sql.Int, req.params.id)
        .query("SELECT * FROM ActivityLogs WHERE user_id = @user_id ORDER BY created_at DESC"),
      pool.request()
        .input("user_id", sql.Int, req.params.id)
        .query("SELECT * FROM Tickets WHERE user_id = @user_id ORDER BY created_at DESC"),
    ]);

    if (userResult.recordset.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json({
      user:    userResult.recordset[0],
      logs:    logsResult.recordset,
      tickets: ticketsResult.recordset,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ── PATCH /api/admin/users/:id/toggle ─────────────────────────────────────
async function toggleUserStatus(req, res) {
  try {
    const pool = await getPool();
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query(`UPDATE Users
              SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END
              WHERE id = @id`);
    res.json({ message: "User status updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ── GET /api/admin/stats ───────────────────────────────────────────────────
async function getDashboardStats(req, res) {
  try {
    const pool   = await getPool();
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Tickets)                                              AS total_tickets,
        (SELECT COUNT(*) FROM Tickets WHERE status = 'Open')                        AS open_tickets,
        (SELECT COUNT(*) FROM Tickets WHERE status = 'In Progress')                 AS inprogress_tickets,
        (SELECT COUNT(*) FROM Tickets WHERE status = 'Resolved')                    AS resolved_tickets,
        (SELECT COUNT(*) FROM Tickets WHERE status = 'Rejected')                    AS rejected_tickets,
        (SELECT COUNT(*) FROM Users    WHERE role  = 'user')                        AS total_users,
        (SELECT COUNT(*) FROM Tickets WHERE priority = 'High' AND status = 'Open')  AS urgent_tickets
    `);
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAllTickets, updateTicketStatus,
  getAllUsers, getUserActivity, toggleUserStatus,
  getDashboardStats,
};


