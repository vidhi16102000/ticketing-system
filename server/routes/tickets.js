const express = require("express");
const router = express.Router();
const {validateCreateTicket} = require("../validators/ticketValidators");
const {authMiddleware} = require("../middleware/auth");
const{ createTicket, getMyTickets, getTicketById } = require("../controllers/ticketController");

router.use(authMiddleware);

router.post("/", validateCreateTicket, createTicket);
router.get("/", getMyTickets);
router.get("/:id", getTicketById);

module.exports= router;