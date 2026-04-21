const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");


require("dotenv").config();

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cookieParser()); // to read cookies

app.use(
  cors({
    origin: "https://auction-xi-five.vercel.app",
    credentials: true,
  })
);

app.use(morgan("dev"));

// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Import Routes
const userRoutes = require("./routes/userRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
const artworkRoutes = require("./routes/artworkRoutes");
const bidRoutes = require("./routes/bidRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// ✅ Use Routes
app.use("/api/users", userRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ✅ Default route
app.get("/", (req, res) => {
  res.send("🚀 Art Auction API is running...");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
