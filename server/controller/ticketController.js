const { getPool } = require("../config/db");
const {logActivity} = require("../utils/logger");
const {LOG_ACTION} = require("../constants/enums");

//unique ticket generation TKT-1001
async function generateTicketNo(pool){
    const result = await pool.request()
        .query("SELECT COUNT(*) AS cnt From Tickets");
    return `TKT-${result.recordset[0].cnt + 1001}`;
}

//POST /api/tickets - create ticket api-----------
async function createTicket(req, res){
    const {category, issue, priority} = req.body;
    try{
        const pool = await getPool();
        const ticketNo = await generateTicketNo(pool);
        const result = await pool.request()
            .input("ticketno.",ticketNo)
            .input("category", category)
            .input("issue", issue)
            .input("priority", priority)
            .input("user_id",sql.Int)
            .query(`INSERT INTO Tickets (TicketNo, Category, Issue, Priority, UserId)
                OUTPUT INSERTED.*
                VALUES (@ticketno., @category, @issue, @priority, @userid);`)

            const TICKET = result.recordset[0];
          await logActivity(req.user.id, LOG_ACTION.TICKET_CREATED, `Raised ticket ${ticketNo}`, req.ip);
          res.status(201).json({message:"Ticket created successfully", ticket: TICKET});
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}

//get my tickets api----------------------
async function getMyTickets(req, res){
    try{
        const pool = await getPool()
        const result = await pool.request()
            .input("user_id", sql.Int, req.user.id)
            .query(`SELECT TOP 1 comment FROM TicketComments where ticket_id = t.id ORDER BY created_at DESC) AS last_comment FROM Tickets t
                Where t.user_id = @user_id
                Order BY t.created_at DESC`);
        res.json(result.recordset);
    } catch(error){
        res.status(500).json({message:error.message});
    }
}

//get /api/tickets/:id - single ticket with comments----------
async function getTicketById (req, res){
    try{
        const pool = await getPool();
        const ticketResult = await pool.request()
            .input("id", sql.Int, req.params.id)
            .input("user-id", sql.Int, req.user.id)
            .input("role", sql.NVarchar, req.user.role)
            .query(`SELECT t.*, u.name as user_name, u.email as user_email
              FROM Tickets t
              JOIN Users u ON t.user_id = u.id
              WHERE t.id = @id AND (t.user_id = @user_id OR @role = 'admin')`)
        if(ticketResult.recordset.length===0)
            return res.status(404).json({message:"Ticket not found"});

        const commentsResult = await pool.request()
            .input("ticket_id, sql.Int, req.params.id")
            .query(`SELECT tc.*, u.name as admin_name
              FROM TicketComments tc
              JOIN Users u ON tc.admin_id = u.id
              WHERE tc.ticket_id = @ticket_id
              ORDER BY tc.created_at ASC`);

            res.json({
                ticket: ticketResult.recordset[0],
                comments: commentsResult.recordset,
            });
    }
    catch(error){
        res.status(500).json({messgae:error.message});
    }
}

module.exports = {createTicket, getMyTickets, getTicketById};