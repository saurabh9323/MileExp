import express from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

// Define flexible schema
const Account = mongoose.models.Account || mongoose.model("Account", new mongoose.Schema({}, { strict: false }), "accounts");

// GET /api/accounts/products  --> (Assessment Question: Distinct list of products)
router.get("/products", verifyToken, async (req, res) => {
  try {
    // Mongo query to list down a distinct list of products
    const products = await Account.distinct("products");
    
    // Formatting it nicely for the frontend charts
    const formattedProducts = products.map((name, index) => ({
      id: index,
      name: name
    }));
    
    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/accounts
router.get("/", verifyToken, async (req, res) => {
  try {
    let query = {};
    if (req.query.ids) {
      const idsArray = req.query.ids.split(",").map(id => parseInt(id));
      query = { account_id: { $in: idsArray } };
    }
    
    const accounts = await Account.find(query);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;