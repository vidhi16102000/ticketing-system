const express = require("express");
const router = express.Router();
const {authMiddleware, adminMiddleware} = require("../middleware/auth");
const {
    getDashboardStats,
    getAllTickets,
    updateTicketStatus,
    getAllUsers,
    getUserActivity,
    toggleUserStatus
} = require("../controller/adminController");
const {validateStatusUpdate} = require("../validator/ticketValidator");

router.use(authMiddleware, adminMiddleware);

router.get("/stats", getDashboardStats);
router.get("/tickets", getAllTickets);
router.patch("/tickets/:id/status", validateStatusUpdate, updateTicketStatus);
router.get("/users", getAllUsers);
router.get("/users/:id/activity",     getUserActivity);
router.patch("/users/:id/toggle",     toggleUserStatus);

module.exports = router;