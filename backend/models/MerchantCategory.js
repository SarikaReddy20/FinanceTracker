import mongoose from "mongoose";

const merchantCategorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  merchant: { type: String, required: true },
  category: { type: String, required: true },
});

merchantCategorySchema.index({ userId: 1, merchant: 1 }, { unique: true });

export default mongoose.model("MerchantCategory", merchantCategorySchema);
