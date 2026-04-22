import express from "express";
import Transaction from "../models/Transaction.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/transactions/account/:account_id
// Returns all transactions for a given account_id
router.get("/account/:account_id", verifyToken, async (req, res) => {
  try {
    const account_id = parseInt(req.params.account_id);
    const bucket = await Transaction.findOne({ account_id }).lean();
    if (!bucket) return res.json({ account_id, transactions: [], transaction_count: 0 });
    res.json(bucket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/low-amount
// Task 3: Account IDs that have made at least one transaction below amount 5000
router.get("/low-amount", verifyToken, async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5000;

    const result = await Transaction.aggregate([
      // Unwind the nested transactions array
      { $unwind: "$transactions" },
      // Keep only docs where the individual transaction amount < threshold
      { $match: { "transactions.amount": { $lt: threshold } } },
      // Group by account_id to deduplicate
      { $group: { _id: "$account_id" } },
      // Sort ascending
      { $sort: { _id: 1 } },
      // Rename _id → account_id
      { $project: { _id: 0, account_id: "$_id" } },
    ]);

    res.json({
      threshold,
      count: result.length,
      account_ids: result.map((r) => r.account_id),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/stats
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const [totalBuckets, totalTxns] = await Promise.all([
      Transaction.countDocuments(),
      Transaction.aggregate([{ $group: { _id: null, total: { $sum: "$transaction_count" } } }]),
    ]);
    res.json({
      buckets: totalBuckets,
      total_transactions: totalTxns[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
