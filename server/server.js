import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import customerRoutes from "./routes/customers.js";
import accountRoutes from "./routes/accounts.js";
import transactionRoutes from "./routes/transactions.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mileexp";

// ── Middleware ──
app.use(cors({
  origin: (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, ""),
  credentials: true,
}));
app.use(express.json());

// ── Routes ──
app.use("/api/customers", customerRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);

// ── Health check ──
app.get("/api/health", (req, res) => res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }));

// ── Connect & Start ──
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected:", MONGO_URI);
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
