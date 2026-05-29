const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  auction: { type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true },
  bidder: { type: mongoose.Schema.Types.ObjectId, ref: "AuctionUser", required: true }, 
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Bid", bidSchema);
