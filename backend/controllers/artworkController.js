const Artwork = require("../models/Artwork");

// Upload artwork
exports.createArtwork = async (req, res) => {
  try {
    const { title, description, imageUrl, category } = req.body;

    // ✅ Take artist from logged-in user
    const artwork = new Artwork({
      title,
      description,
      imageUrl,
      category,
      artist: req.user._id,
    });

    await artwork.save();

    // ✅ Populate artist (username + email)
    await artwork.populate("artist", "username email");

    res.status(201).json(artwork);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all artworks
exports.getArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find().populate("artist", "username email");
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single artwork
exports.getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id).populate(
      "artist",
      "username email"
    );
    if (!artwork) return res.status(404).json({ message: "Artwork not found" });
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
