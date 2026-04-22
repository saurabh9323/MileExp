import express from "express";
import Account from "../models/Account.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/accounts — list all (optional ?ids=1,2,3 filter)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { ids } = req.query;
    const filter = {};
    if (ids) {
      const idList = ids.split(",").map(Number).filter(Boolean);
      filter.account_id = { $in: idList };
    }
    const accounts = await Account.find(filter).sort({ account_id: 1 }).lean();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ FIX: /products MUST be defined BEFORE /:account_id
// Otherwise Express matches "products" as the :account_id param
// GET /api/accounts/products — distinct product list (Task 4)
router.get("/products", verifyToken, async (req, res) => {
  try {
    const products = await Account.distinct("products");
    res.json(products.sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/accounts/:account_id
router.get("/:account_id", verifyToken, async (req, res) => {
  try {
    const account = await Account.findOne({
      account_id: parseInt(req.params.account_id),
    }).lean();
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
