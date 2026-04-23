import express from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

// Define flexible schema
const Customer = mongoose.models.Customer || mongoose.model("Customer", new mongoose.Schema({}, { strict: false }), "customers");

// GET /api/customers/stats
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const total = await Customer.countDocuments();
    const active = await Customer.countDocuments({ active: true });
    res.json({ total, active });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/customers
router.get("/", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    let query = {};

    // Handle Active/Inactive filter
    if (req.query.active === "true") query.active = true;
    if (req.query.active === "false") query.active = false;

    // Handle Search (Name, Username, Address)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [
        { name: searchRegex },
        { username: searchRegex },
        { address: searchRegex },
        { email: searchRegex }
      ];
    }

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query).skip(skip).limit(limit);

    res.json({
      data: customers,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;