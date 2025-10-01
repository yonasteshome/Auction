const Payment = require("../models/Payment");
const Auction = require("../models/Auction");



// Auto payment for winner (no need to send auctionId)
exports.createPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    // ✅ Find auction where this user is the winner & status is ended
    const auction = await Auction.findOne({
      winner: req.user._id,
      status: "ended"
    }).populate("artwork seller winner");

    if (!auction) {
      return res.status(404).json({ error: "No auction found where you are the winner." });
    }

    // ✅ Prevent duplicate payment
    const existingPayment = await Payment.findOne({ auction: auction._id, user: req.user._id });
    if (existingPayment) {
      return res.status(400).json({ error: "Payment already made for this auction" });
    }

    // ✅ Auto take amount from currentPrice
    const amount = auction.currentPrice;

    const payment = new Payment({
      user: req.user._id,
      auction: auction._id,
      amount,
      paymentMethod,
      status: "completed" // later integrate real gateway
    });

    await payment.save();

    res.status(201).json({
      message: "Payment successful",
      payment,
      auctionDetails: {
        artwork: auction.artwork.title,
        finalPrice: amount,
        seller: auction.seller.username
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get logged-in user's payments
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("auction", "artwork currentPrice")
      .populate("user", "username email");
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
