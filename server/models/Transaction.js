import mongoose from "mongoose";

const txnSchema = new mongoose.Schema(
  {
    date: { type: Date },
    amount: { type: Number },
    transaction_code: { type: String },
    symbol: { type: String },
    price: { type: String },
    total: { type: String },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    _id: { type: String },
    account_id: { type: Number, required: true, index: true },
    transaction_count: { type: Number },
    bucket_start_date: { type: Date },
    bucket_end_date: { type: Date },
    transactions: [txnSchema],
  },
  { timestamps: false }
);

export default mongoose.model("Transaction", transactionSchema, "transactions");
