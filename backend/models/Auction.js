const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema({
  artwork: { type: mongoose.Schema.Types.ObjectId, ref: "Artwork", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "AuctionUser", required: true },
  startPrice: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ["upcoming", "active", "ended"],
    default: "upcoming"
  },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "AuctionUser" }, 
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model("Auction", auctionSchema);
