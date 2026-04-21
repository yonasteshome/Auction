const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "AuctionUser", required: true },  // ✅ Fix ref
  auction: { type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["stripe", "paypal"], required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", paymentSchema);
