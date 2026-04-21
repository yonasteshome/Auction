const Auction = require("../models/Auction");
const Bid = require("../models/Bid");


// 🔄 Helper: update status based on time unless already ended manually
const updateAuctionStatus = (auction) => {
  if (auction.status === "ended") {
    return auction; // don't overwrite manual end
  }

  const now = new Date();
  if (now < auction.startTime) {
    auction.status = "upcoming";
  } else if (now >= auction.startTime && now <= auction.endTime) {
    auction.status = "active";
  } else {
    auction.status = "ended";
  }
  return auction;
};


// ✅ Create Auction
const createAuction = async (req, res) => {
  try {
    const { artworkId, startPrice, startTime, endTime } = req.body;

    if (!artworkId || !startPrice || !startTime || !endTime) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newAuction = new Auction({
      artwork: artworkId,
      seller: req.user._id,
      startPrice,
      currentPrice: startPrice,
      startTime,
      endTime
    });

    updateAuctionStatus(newAuction);
    await newAuction.save();

    const populatedAuction = await Auction.findById(newAuction._id)
      .populate("artwork", "title imageUrl")
      .populate("seller", "username email");

    res.status(201).json({ message: "Auction created successfully", auction: populatedAuction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all auctions (auto-update status)
const getAuctions = async (req, res) => {
  try {
    let auctions = await Auction.find()
      .populate("artwork", "title imageUrl")
      .populate("seller", "username email");

    auctions = auctions.map((auction) => updateAuctionStatus(auction));

    res.json(auctions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get auction by ID (auto-update status)
const getAuctionById = async (req, res) => {
  try {
    let auction = await Auction.findById(req.params.id)
      .populate("artwork", "title description imageUrl")
      .populate("seller", "username email")
      .populate("winner", "username email");

    if (!auction) return res.status(404).json({ error: "Auction not found" });

    auction = updateAuctionStatus(auction);

    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update auction (only seller/admin)
const updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: "Auction not found" });

    if (auction.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to update this auction" });
    }

    Object.assign(auction, req.body);
    updateAuctionStatus(auction);
    await auction.save();

    const updatedAuction = await Auction.findById(auction._id)
      .populate("artwork", "title imageUrl")
      .populate("seller", "username email");

    res.json({ message: "Auction updated", auction: updatedAuction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete auction
const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: "Auction not found" });

    if (auction.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete this auction" });
    }

    await auction.deleteOne();
    res.json({ message: "Auction deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Force end auction
const endAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    auction.status = "ended";
    await auction.save();

    res.json({ message: "Auction ended successfully", auction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Get all auctions created by the logged-in artist
const getAuctionsByArtist = async (req, res) => {
  try {
    const artistId = req.user._id;

    let auctions = await Auction.find({ seller: artistId })
      .populate("artwork", "title description imageUrl")
      .populate("winner", "username email");

    // attach bids for each auction
    const result = await Promise.all(
      auctions.map(async (auction) => {
        const bids = await Bid.find({ auction: auction._id })
          .populate("bidder", "username email")
          .sort({ amount: -1 });

        return {
          ...auction.toObject(),
          bids,
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




module.exports = {
  createAuction,
  getAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction,
  endAuction,
  getAuctionsByArtist
};
