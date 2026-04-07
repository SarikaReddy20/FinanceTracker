import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sourceDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadedDocument",
      default: null,
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
      enum: ["PDF", "CSV", "MANUAL", "BILL"],
      default: "PDF",
    },
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, date: 1 });
transactionSchema.index({ userId: 1, amount: 1, type: 1, date: 1 });
transactionSchema.index({ userId: 1, sourceDocumentId: 1 });

export default mongoose.model("Transaction", transactionSchema);
