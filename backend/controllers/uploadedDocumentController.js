import fs from "fs/promises";
import path from "path";
import UploadedDocument from "../models/UploadedDocument.js";
import Transaction from "../models/Transaction.js";

const serializeDocument = (document) => ({
  _id: document._id,
  originalName: document.originalName,
  documentType: document.documentType,
  mimeType: document.mimeType,
  size: document.size,
  createdAt: document.createdAt,
});

export const listUploadedDocuments = async (req, res) => {
  try {
    const documents = await UploadedDocument.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();

    return res.json({
      documents: documents.map(serializeDocument),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUploadedDocumentContent = async (req, res) => {
  try {
    const document = await UploadedDocument.findOne({ _id: req.params.id, userId: req.user.id });

    if (!document) {
      return res.status(404).json({ message: "Uploaded file not found" });
    }

    const resolvedPath = path.resolve(document.storagePath);
    await fs.access(resolvedPath);

    res.setHeader("Content-Type", document.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${document.originalName}"`);
    return res.sendFile(resolvedPath);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteUploadedDocument = async (req, res) => {
  try {
    const document = await UploadedDocument.findOne({ _id: req.params.id, userId: req.user.id });

    if (!document) {
      return res.status(404).json({ message: "Uploaded file not found" });
    }

    await Transaction.deleteMany({
      userId: req.user.id,
      sourceDocumentId: document._id,
    });

    await UploadedDocument.deleteOne({ _id: document._id });
    await fs.unlink(path.resolve(document.storagePath)).catch(() => {});

    return res.json({
      message: "Uploaded file and extracted data deleted successfully",
      deletedDocumentId: document._id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
