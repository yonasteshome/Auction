const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: "AuctionUser", required: true },
  category: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Artwork", artworkSchema);
