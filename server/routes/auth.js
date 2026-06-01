const express = require("express");
const { validateRegister, validateLogin } = require("../validator/authValidator");
const router = express.Router();
const {register , login, profile } = require("../controller/authController");
const {authMiddleware} = require("../middleware/auth")

router.post("/register", validateRegister, register);
router.post("/login", validateLogin,login);
router.get("/profile", authMiddleware. profile);

module.exports = router;

router.post("/logout",authMiddleware, async(req,res)=>{
    const {logActivity} = require("../utils/logger")
    const {LOG_ACTIONS} = require("../constants/enums")
    await logActivity(req.user.id, LOG_ACTIONS.LOGOUT, "User Logged Out", req.ip)
    res.json({message:"logged out successfully"});
})