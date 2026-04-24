import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; // ✅ Using our User schema

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "mileexp_secret_key";

// ── Helper: generate JWT with user info ──
const generateToken = (user) => {
  return jwt.sign(
    {
      uid:      user._id,
      name:     user.name,
      email:    user.email,
      provider: user.provider || "email",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ─────────────────────────────────────────
// POST /api/auth/signup
// Body: { name, email, password }
// ─────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user using our User schema
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: "email",
    });

    // Generate JWT
    const token = generateToken(user);

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        uid:      user._id,
        name:     user.name,
        email:    user.email,
        provider: user.provider,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────
// POST /api/auth/signin
// Body: { email, password }
// ─────────────────────────────────────────
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Find user using our User schema
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "No account found with this email." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    // Generate JWT
    const token = generateToken(user);

    res.json({
      message: "Signed in successfully.",
      token,
      user: {
        uid:      user._id,
        name:     user.name,
        email:    user.email,
        provider: user.provider,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────
// GET /api/auth/me
// Header: Authorization: Bearer <token>
// ─────────────────────────────────────────
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing token." });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch from DB using our User schema — exclude password
    const user = await User.findById(decoded.uid).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });

    res.json({
      uid:       user._id,
      name:      user.name,
      email:     user.email,
      provider:  user.provider,
      photoURL:  user.photoURL,
      createdAt: user.createdAt,
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please sign in again." });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;