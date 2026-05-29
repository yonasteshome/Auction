const Auction = require("../models/Auction");
const Bid = require("../models/Bid");

const MS_PER_HOUR = 60 * 60 * 1000;


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

const fetchAuctionsWithStatus = async () => {
  const auctions = await Auction.find()
    .populate("artwork", "title imageUrl")
    .populate("seller", "username email");

  return auctions.map((auction) => updateAuctionStatus(auction));
};

// ✅ Get all auctions (auto-update status)
const getAuctions = async (req, res) => {
  try {
    const auctions = await fetchAuctionsWithStatus();

    res.json(auctions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get only currently active auctions
const getActiveAuctions = async (req, res) => {
  try {
    const auctions = await fetchAuctionsWithStatus();
    const activeAuctions = auctions.filter((auction) => auction.status === "active");

    res.json(activeAuctions);
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

// ✅ Get auction insights for the dashboard-style UI
const getAuctionInsights = async (req, res) => {
  try {
    const auctions = await fetchAuctionsWithStatus();
    const auctionIds = auctions.map((auction) => auction._id);
    const bids = auctionIds.length
      ? await Bid.find({ auction: { $in: auctionIds } }).sort({ amount: -1 })
      : [];

    const now = new Date();
    const activeAuctions = auctions.filter((auction) => auction.status === "active");
    const upcomingAuctions = auctions.filter((auction) => auction.status === "upcoming");
    const endedAuctions = auctions.filter((auction) => auction.status === "ended");
    const closingSoonAuctions = activeAuctions.filter(
      (auction) => new Date(auction.endTime).getTime() - now.getTime() <= 24 * MS_PER_HOUR
    );

    const totalStartingPrice = auctions.reduce((sum, auction) => sum + (auction.startPrice || 0), 0);
    const totalCurrentPrice = auctions.reduce(
      (sum, auction) => sum + (auction.currentPrice || auction.startPrice || 0),
      0
    );
    const topAuction = auctions.reduce((currentTop, auction) => {
      if (!currentTop) return auction;
      const currentTopPrice = currentTop.currentPrice || currentTop.startPrice || 0;
      const auctionPrice = auction.currentPrice || auction.startPrice || 0;
      return auctionPrice > currentTopPrice ? auction : currentTop;
    }, null);

    res.json({
      totals: {
        auctions: auctions.length,
        active: activeAuctions.length,
        upcoming: upcomingAuctions.length,
        ended: endedAuctions.length,
        bids: bids.length,
      },
      pricing: {
        averageStartingPrice: auctions.length ? totalStartingPrice / auctions.length : 0,
        averageCurrentPrice: auctions.length ? totalCurrentPrice / auctions.length : 0,
      },
      closingSoon: closingSoonAuctions.map((auction) => ({
        id: auction._id,
        title: auction.artwork?.title || "Untitled Artwork",
        currentPrice: auction.currentPrice || auction.startPrice || 0,
        endTime: auction.endTime,
      })),
      topAuction: topAuction
        ? {
            id: topAuction._id,
            title: topAuction.artwork?.title || "Untitled Artwork",
            currentPrice: topAuction.currentPrice || topAuction.startPrice || 0,
            endTime: topAuction.endTime,
          }
        : null,
    });
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
  getActiveAuctions,
  getAuctionInsights,
  getAuctionById,
  updateAuction,
  deleteAuction,
  endAuction,
  getAuctionsByArtist
};
