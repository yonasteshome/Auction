const Bid = require("../models/Bid");
const Auction = require("../models/Auction");
// Place a bid
const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const { auctionId } = req.params;
    const bidder = req.user.id; // from authMiddleware

    if (!amount) {
      return res.status(400).json({ error: "Bid amount is required" });
    }

    // ✅ Find auction
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // ✅ Block if auction ended manually
    if (auction.status === "ended") {
      return res.status(400).json({ error: "Auction has already ended" });
    }

    // ✅ Check if auction is active by time
    const now = new Date();
    if (now < auction.startTime) {
      return res.status(400).json({ error: "Auction has not started yet" });
    }
    if (now > auction.endTime) {
      // auto-end auction
      auction.status = "ended";
      await auction.save();
      return res.status(400).json({ error: "Auction has already ended" });
    }

    // ✅ Validate bid amount
    if (amount < auction.startPrice) {
      return res.status(400).json({ error: `Bid must be at least the starting price: ${auction.startPrice}` });
    }
    if (amount <= auction.currentPrice) {
      return res.status(400).json({ error: `Bid must be higher than the current price: ${auction.currentPrice}` });
    }

    // ✅ Create new bid
    const newBid = new Bid({
      auction: auctionId,
      bidder,
      amount,
    });
    await newBid.save();

    // ✅ Update auction currentPrice & winner
    auction.currentPrice = amount;
    auction.winner = bidder;
    auction.status = "active"; // once someone bids, mark active
    await auction.save();

    res.status(201).json({
      message: "Bid placed successfully",
      bid: newBid,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bids for a specific auction
const getBidsByAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const bids = await Bid.find({ auction: auctionId })
      .populate("bidder", "username email")
      .sort({ amount: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { placeBid, getBidsByAuction };
