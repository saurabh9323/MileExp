import mongoose from "mongoose";

const tierDetailSchema = new mongoose.Schema(
  {
    tier: String,
    benefits: [String],
    active: Boolean,
    id: String,
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    _id: { type: String },
    username: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String },
    birthdate: { type: Date },
    email: { type: String },
    active: { type: Boolean, default: false },
    accounts: [{ type: Number }],
    tier_and_details: { type: Map, of: tierDetailSchema },
  },
  { timestamps: false }
);

export default mongoose.model("Customer", customerSchema, "customers");
