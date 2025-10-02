const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

// ✅ Winner makes payment
router.post(
  "/",
  authMiddleware,
  requireRole(["user", "admin"]),
  paymentController.createPayment
);

// ✅ Logged-in user can see ONLY their paid payments
router.get("/me", authMiddleware, paymentController.getMyPayments);

// ✅ Logged-in user can see ALL orders (paid + unpaid)
router.get("/orders", authMiddleware, paymentController.getAllOrders);

module.exports = router;
