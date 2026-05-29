const Payment = require("../models/Payment");

// ✅ Get all orders for logged-in user (paid + unpaid)
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("auction")
      .populate("user");

    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// ✅ Make payment
exports.createPayment = async (req, res) => {
  try {
    const { auction, amount, paymentMethod } = req.body;

    const payment = await Payment.create({
      user: req.user._id,
      auction,
      amount,
      paymentMethod,
      status: "completed", // change to "pending" first if you want 2-step confirmation
    });

    res.json({
      message: "Payment successful",
      payment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment failed" });
  }
};
