const express = require("express");
const router = express.Router();
const artworkController = require("../controllers/artworkController");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

// Only sellers can upload artworks
router.post("/", authMiddleware, requireRole(["artist", "seller", "admin"]), artworkController.createArtwork);

// Everyone can view
router.get("/", artworkController.getArtworks);
router.get("/:id", artworkController.getArtworkById);

module.exports = router;
