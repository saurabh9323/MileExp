import express from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

// Define flexible schema
const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", new mongoose.Schema({}, { strict: false }), "transactions");

// GET /api/transactions/low-amount --> (Assessment Question: Transactions below 5000)
router.get("/low-amount", verifyToken,async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5000;

    // Mongo query to list down account IDs which has made at least one transaction below 5000
    const accounts = await Transaction.aggregate([
      { $unwind: "$transactions" },
      { $match: { "transactions.amount": { $lt: threshold } } },
      { $group: { _id: "$account_id" } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, account_id: "$_id" } }
    ]);

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transactions/account/:account_id
router.get("/account/:account_id", verifyToken, async (req, res) => {
  try {
    const accountId = parseInt(req.params.account_id);
    
    const transactionData = await Transaction.findOne({ account_id: accountId });
    
    if (!transactionData) {
      return res.json({ account_id: accountId, transactions: [] });
    }

    res.json(transactionData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;