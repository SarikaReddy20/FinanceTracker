import mongoose from "mongoose";

const uploadedDocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    storedName: {
      type: String,
      required: true,
      trim: true,
    },
    storagePath: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    contentHash: {
      type: String,
      required: true,
      trim: true,
    },
    documentType: {
      type: String,
      enum: ["PDF", "BILL"],
      required: true,
    },
  },
  { timestamps: true },
);

uploadedDocumentSchema.index({ userId: 1, createdAt: -1 });
uploadedDocumentSchema.index({ userId: 1, documentType: 1, contentHash: 1 });

export default mongoose.model("UploadedDocument", uploadedDocumentSchema);
