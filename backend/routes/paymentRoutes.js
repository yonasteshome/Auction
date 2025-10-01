const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

// ✅ Winner makes payment
router.post("/", authMiddleware, requireRole(["user", "admin"]), paymentController.createPayment);

// ✅ Logged-in user can see their payments
router.get("/me", authMiddleware, paymentController.getMyPayments);

module.exports = router;
