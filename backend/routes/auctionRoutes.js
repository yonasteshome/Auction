const express = require("express");
const router = express.Router();
const {
  createAuction,
  getAuctions,
  getActiveAuctions,
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
router.get("/active", getActiveAuctions);

// ✅ Only sellers/admins can update or delete their auctions
router.put("/:id", authMiddleware, requireRole(["artist", "admin"]), updateAuction);
router.put("/:id/end", authMiddleware, requireRole(["admin","artist"]), endAuction);

router.delete("/:id", authMiddleware, requireRole(["artist", "admin"]), deleteAuction);
// ✅ Get logged-in artist's auctions
router.get("/my-auctions", authMiddleware, requireRole(["artist"]), getAuctionsByArtist);
router.get("/:id", getAuctionById);
module.exports = router;
