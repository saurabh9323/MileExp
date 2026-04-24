import mongoose from "mongoose";

// For users who sign up with email/password (not Google OAuth)
const userSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true },          // bcrypt hashed
    photoURL:  { type: String, default: null },           // for Google profile pic if needed
    provider:  { type: String, default: "email" },        // "email" | "google"
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema, "users");
