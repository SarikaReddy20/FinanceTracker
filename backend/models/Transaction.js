import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },

    type: {
      type: String,
      enum: ["DEBIT", "CREDIT"],
      required: true,
    },

    category: { type: String, default: "Uncategorized" },

    categorized: { type: Boolean, default: false },

    source: {
      type: String,
      enum: ["PDF", "CSV", "MANUAL"],
      default: "PDF",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Transaction", transactionSchema);
