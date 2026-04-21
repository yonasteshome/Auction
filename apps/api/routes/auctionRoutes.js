const express = require("express");
const router = express.Router();
const {
  createAuction,
  getAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction,
  endAuction,
  getAuctionsByArtist
} = require("../controllers/auctionController");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

// ✅ Only sellers/admins can create auctions
router.post("/", authMiddleware, requireRole(["admin","artist"]), createAuction);

// ✅ Everyone can view auctions
router.get("/", getAuctions);
router.get("/:id", getAuctionById);

// ✅ Only sellers/admins can update or delete their auctions
router.put("/:id", authMiddleware, requireRole(["artist", "admin"]), updateAuction);
router.put("/:id/end", authMiddleware, requireRole(["admin","artist"]), endAuction);

router.delete("/:id", authMiddleware, requireRole(["artist", "admin"]), deleteAuction);

// ✅ Get only active auctions
router.get("/active", async (req, res) => {
  try {
    const now = new Date()
    const activeAuctions = await Auction.find({ endTime: { $gt: now } })
    res.json(activeAuctions)
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch active auctions" })
  }
})
// ✅ Get logged-in artist's auctions
router.get("/my-auctions", authMiddleware, requireRole(["artist"]), getAuctionsByArtist);
module.exports = router;
