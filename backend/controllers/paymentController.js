const Payment = require("../models/Payment");
const Auction = require("../models/Auction");

// Get all PAID orders (payments)
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("auction")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

// Get UNPAID auctions (won but not paid yet)
exports.getMyUnpaidAuctions = async (req, res) => {
  try {
    // Find auctions where current user is winner
    const myAuctions = await Auction.find({ winner: req.user._id })
      .populate("artwork")
      .sort({ endTime: -1 });

    // Get all auctions already paid
    const myPayments = await Payment.find({ user: req.user._id });
    const paidAuctionIds = myPayments.map((p) => p.auction.toString());

    // Filter out unpaid
    const unpaid = myAuctions.filter(
      (a) => !paidAuctionIds.includes(a._id.toString())
    );

    res.json(unpaid);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unpaid auctions" });
  }
};

// If you want one endpoint for BOTH (paid + unpaid)
exports.getAllOrders = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("auction")
      .sort({ createdAt: -1 });

    const myAuctions = await Auction.find({ winner: req.user._id });
    const paidAuctionIds = payments.map((p) => p.auction.toString());
    const unpaid = myAuctions.filter(
      (a) => !paidAuctionIds.includes(a._id.toString())
    );

    res.json({
      paid: payments,
      unpaid: unpaid,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
