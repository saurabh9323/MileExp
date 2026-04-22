import express from "express";
import Customer from "../models/Customer.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/customers
router.get("/", verifyToken, async (req, res) => {
  try {
    const { active, search, page = 1, limit = 20 } = req.query;

    const filter = {};

    // ✅ FIX: active field in MongoDB is a boolean — convert string param correctly
    if (active === "true") filter.active = true;
    else if (active === "false") filter.active = false;
    // else "all" — no filter applied

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ name: 1 }).skip(skip).limit(parseInt(limit)).lean(),
      Customer.countDocuments(filter),
    ]);

    res.json({
      data: customers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customers/stats
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const [total, active] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ active: true }),
    ]);
    res.json({ total, active, inactive: total - active });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customers/:id
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
