import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import UploadedDocument from "../models/UploadedDocument.js";
import Transaction from "../models/Transaction.js";
import { toIstISOString } from "../utils/dateFormatter.js";

const documentToObjectId = (value) => new mongoose.Types.ObjectId(value);

const serializeDocument = (document) => ({
  _id: document._id,
  originalName: document.originalName,
  documentType: document.documentType,
  mimeType: document.mimeType,
  size: document.size,
  createdAt: document.createdAt,
  transactionCount: document.transactionCount || 0,
  transactionStartDate: document.transactionStartDate
    ? toIstISOString(document.transactionStartDate)
    : null,
  transactionEndDate: document.transactionEndDate
    ? toIstISOString(document.transactionEndDate)
    : null,
});

export const listUploadedDocuments = async (req, res) => {
  try {
    const documentType = ["PDF", "BILL"].includes(req.query.documentType)
      ? req.query.documentType
      : null;

    const documents = await UploadedDocument.aggregate([
      {
        $match: {
          userId: documentToObjectId(req.user.id),
          ...(documentType ? { documentType } : {}),
        },
      },
      {
        $lookup: {
          from: "transactions",
          let: { docId: "$_id", ownerId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$sourceDocumentId", "$$docId"] },
                    { $eq: ["$userId", "$$ownerId"] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                minDate: { $min: "$date" },
                maxDate: { $max: "$date" },
              },
            },
          ],
          as: "relatedStats",
        },
      },
      {
        $addFields: {
          transactionCount: {
            $ifNull: [{ $arrayElemAt: ["$relatedStats.count", 0] }, 0],
          },
          transactionStartDate: { $arrayElemAt: ["$relatedStats.minDate", 0] },
          transactionEndDate: { $arrayElemAt: ["$relatedStats.maxDate", 0] },
          dedupeKey: {
            $concat: [
              "$documentType",
              ":",
              { $ifNull: ["$contentHash", { $toString: "$_id" }] },
            ],
          },
        },
      },
      {
        $match: {
          transactionCount: { $gt: 0 },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    const uniqueDocuments = [];
    const seen = new Set();

    for (const document of documents) {
      if (seen.has(document.dedupeKey)) {
        continue;
      }
      seen.add(document.dedupeKey);
      uniqueDocuments.push(document);
    }

    return res.json({
      documents: uniqueDocuments.map(serializeDocument),
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
