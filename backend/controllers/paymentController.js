const Payment = require("../models/Payment");
const Auction = require("../models/Auction");

// ✅ Paid payments only
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

// ✅ ALL orders (paid + unpaid)
exports.getAllOrders = async (req, res) => {
  try {
    // 1️⃣ Paid orders
    const payments = await Payment.find({ user: req.user._id })
      .populate("auction")
      .sort({ createdAt: -1 });

    // 2️⃣ Auctions user won
    const myAuctions = await Auction.find({ winner: req.user._id });
    const paidAuctionIds = payments.map((p) => p.auction._id.toString());

    // 3️⃣ Filter unpaid
    const unpaid = myAuctions.filter(
      (a) => !paidAuctionIds.includes(a._id.toString())
    );

    // 4️⃣ Format unpaid like payments so frontend can handle both
    const unpaidFormatted = unpaid.map((auction) => ({
      _id: auction._id,
      auction: auction,
      amount: auction.finalPrice || auction.currentPrice,
      paymentMethod: null,
      status: "unpaid",
      createdAt: auction.updatedAt || auction.createdAt,
    }));

    // 5️⃣ Merge
    const allOrders = [
      ...payments.map((p) => ({
        _id: p._id,
        auction: p.auction,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        status: p.status,
        createdAt: p.createdAt,
      })),
      ...unpaidFormatted,
    ];

    res.json(allOrders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
