const express = require("express");
const router = express.Router();
const { placeBid, getBidsByAuction } = require("../controllers/bidController");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

// Place bid on specific auction
router.post("/:auctionId", authMiddleware, requireRole(["user", "admin"]), placeBid);

// Get all bids for a specific auction
router.get("/:auctionId", getBidsByAuction);


module.exports = router;
