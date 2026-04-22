import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    _id: { type: String },
    account_id: { type: Number, required: true, unique: true, index: true },
    limit: { type: Number },
    products: [{ type: String }],
  },
  { timestamps: false }
);

export default mongoose.model("Account", accountSchema, "accounts");
