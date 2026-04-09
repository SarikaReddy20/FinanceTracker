import fs from "fs/promises";
import { createHash } from "crypto";

import { parsePDF } from "../services/pdfParser.js";
import { extractTransactions } from "../services/transactionExtractor.js";
import { detectCategory } from "../services/categoryService.js";
import { extractMerchant } from "../services/extractMerchant.js";
import { extractBillText } from "../services/billOcrService.js";
import { extractBillDetails } from "../services/billExtractor.js";

import Transaction from "../models/Transaction.js";
import MerchantCategory from "../models/MerchantCategory.js";
import UploadedDocument from "../models/UploadedDocument.js";
import { isDuplicateTransaction } from "../utils/duplicateChecker.js";
import {
  serializeTransaction,
  serializeTransactions,
  toIstISOString,
} from "../utils/dateFormatter.js";

const isValidDate = (value) => !Number.isNaN(value.getTime());
const TIME_ONLY_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const UNCATEGORIZED_LABEL = "Uncategorized";

const cleanupUploadedDocument = async (uploadedDocument, filePath) => {
  if (uploadedDocument?._id) {
    await UploadedDocument.deleteOne({ _id: uploadedDocument._id }).catch(() => {});
  }
  if (filePath) {
    await fs.unlink(filePath).catch(() => {});
  }
};

const getContentHash = async (filePath) => {
  const fileBuffer = await fs.readFile(filePath);
  return createHash("sha256").update(fileBuffer).digest("hex");
};

const findDuplicateDocument = async ({ userId, documentType, contentHash }) => {
  const existing = await UploadedDocument.findOne({ userId, documentType, contentHash }).lean();
  if (!existing) {
    return null;
  }

  const relatedTransactions = await Transaction.countDocuments({
    userId,
    sourceDocumentId: existing._id,
  });

  return relatedTransactions > 0 ? existing : null;
};

const parseManualTransactionDate = (dateInput, timeInput) => {
  const now = new Date();

  if (!dateInput && !timeInput) {
    return now;
  }

  let baseDate = new Date(now);

  if (dateInput) {
    const parsedDate = new Date(dateInput);
    if (!isValidDate(parsedDate)) {
      return null;
    }
    baseDate = parsedDate;
  }

  if (timeInput) {
    const match = String(timeInput).trim().match(TIME_ONLY_PATTERN);
    if (!match) {
      return null;
    }

    baseDate.setHours(Number(match[1]), Number(match[2]), 0, 0);
  } else {
    baseDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);
  }

  return baseDate;
};

// =======================
// Upload PDF
// =======================
export const uploadPDF = async (req, res) => {
  let filePath;
  let uploadedDocument;

  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;
    filePath = req.file.path;
    const contentHash = await getContentHash(filePath);
    const duplicateDocument = await findDuplicateDocument({
      userId,
      documentType: "PDF",
      contentHash,
    });

    if (duplicateDocument) {
      await fs.unlink(filePath).catch(() => {});
      return res.status(409).json({
        message: "Duplicate file upload blocked. This statement was already imported.",
        duplicate: true,
      });
    }

    uploadedDocument = await UploadedDocument.create({
      userId,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      storagePath: filePath,
      mimeType: req.file.mimetype,
      size: req.file.size,
      documentType: "PDF",
      contentHash,
    });

    const text = await parsePDF(filePath);
    const transactions = extractTransactions(text);

    const saved = [];
    const duplicates = [];
    const uncategorized = [];
    const invalidRows = [];

    const seen = new Set();

    for (const t of transactions) {
      const normalizedDate = new Date(t.date);

      if (!isValidDate(normalizedDate)) {
        invalidRows.push({
          description: t.description,
          amount: t.amount,
          rawDate: t.date,
        });
        continue;
      }

      const key = `${t.type}-${t.amount}-${t.description}-${normalizedDate.getTime()}`;

      if (seen.has(key)) {
        duplicates.push({
          description: t.description,
          amount: t.amount,
          date: toIstISOString(normalizedDate),
        });
        continue;
      }
      seen.add(key);

      const category = await detectCategory(t.description, t.type, userId);

      const isDuplicate = await isDuplicateTransaction({
        userId,
        date: normalizedDate,
        amount: t.amount,
        description: t.description,
        type: t.type,
      });

      if (isDuplicate) {
        duplicates.push({
          description: t.description,
          amount: t.amount,
          date: toIstISOString(normalizedDate),
        });
        continue;
      }

      const newTransaction = await Transaction.create({
        userId,
        sourceDocumentId: uploadedDocument._id,
        date: normalizedDate,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: category || UNCATEGORIZED_LABEL,
        categorized: !!category,
        source: "PDF",
      });

      saved.push(newTransaction);

      if (!category) {
        uncategorized.push(newTransaction);
      }
    }

    if (!saved.length) {
      await cleanupUploadedDocument(uploadedDocument, filePath);
      return res.status(200).json({
        message: "No new transactions were added. This statement appears to be already imported.",
        totalAdded: 0,
        duplicatesCount: duplicates.length,
        invalidRowsCount: invalidRows.length,
        duplicates,
        invalidRows,
        uncategorized: [],
      });
    }

    res.json({
      message: "PDF processed successfully",
      totalAdded: saved.length,
      duplicatesCount: duplicates.length,
      invalidRowsCount: invalidRows.length,
      duplicates,
      invalidRows,
      uncategorized: serializeTransactions(uncategorized),
      uploadedDocumentId: uploadedDocument._id,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
    await cleanupUploadedDocument(uploadedDocument, filePath);
  }
};

// =======================
// Update Category
// =======================
export const updateCategory = async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const merchant = extractMerchant(transaction.description);

    if (merchant) {
      await MerchantCategory.findOneAndUpdate(
        { userId: transaction.userId, merchant },
        { category },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }

    transaction.category = category;
    transaction.categorized = true;

    await transaction.save();

    res.json(serializeTransaction(transaction));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// Manual Transaction
// =======================
export const addManualTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, time, description, amount, type, category: manualCategory } = req.body;

    if (!description || !amount || !type) {
      return res.status(400).json({ message: "Description, amount, and type are required" });
    }

    if (!["DEBIT", "CREDIT"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    const normalizedDate = parseManualTransactionDate(date, time);
    if (!normalizedDate || !isValidDate(normalizedDate)) {
      return res.status(400).json({ message: "Invalid transaction date or time" });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a valid number" });
    }

    const normalizedDescription = description.trim();
    const normalizedManualCategory = manualCategory?.trim();
    const category = normalizedManualCategory || await detectCategory(normalizedDescription, type, userId);

    const isDuplicate = await isDuplicateTransaction({
      userId,
      date: normalizedDate,
      amount: numericAmount,
      description: normalizedDescription,
      type,
    });

    if (isDuplicate) {
      return res.status(400).json({
        message: "Duplicate transaction detected",
      });
    }

    const transaction = await Transaction.create({
      userId,
      date: normalizedDate,
      description: normalizedDescription,
      amount: numericAmount,
      type,
      category: category || "Uncategorized",
      categorized: !!category,
      source: "MANUAL",
    });

    res.json({
      message: "Transaction added successfully",
      transaction: serializeTransaction(transaction),
    });
  } catch (error) {
    console.error("MANUAL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getManualTransactions = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(Number.parseInt(req.query.limit || "5", 10), 1);

    const query = {
      userId: req.user.id,
      source: "MANUAL",
    };

    const [items, total] = await Promise.all([
      Transaction.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    return res.json({
      page,
      limit,
      total,
      hasMore: page * limit < total,
      transactions: serializeTransactions(items),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateManualTransaction = async (req, res) => {
  try {
    const { date, time, description, amount, type, category: manualCategory } = req.body;

    if (!description || !amount || !type) {
      return res.status(400).json({ message: "Description, amount, and type are required" });
    }

    if (!["DEBIT", "CREDIT"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
      source: "MANUAL",
    });

    if (!transaction) {
      return res.status(404).json({ message: "Manual transaction not found" });
    }

    const normalizedDate = parseManualTransactionDate(date, time);
    if (!normalizedDate || !isValidDate(normalizedDate)) {
      return res.status(400).json({ message: "Invalid transaction date or time" });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a valid number" });
    }

    const normalizedDescription = description.trim();
    const normalizedManualCategory = manualCategory?.trim();
    const category = normalizedManualCategory
      || await detectCategory(normalizedDescription, type, req.user.id);

    // Duplicate check excluding the same manual transaction.
    const timeWindow = 30 * 1000;
    const fromTime = new Date(normalizedDate.getTime() - timeWindow);
    const toTime = new Date(normalizedDate.getTime() + timeWindow);
    const duplicate = await Transaction.findOne({
      _id: { $ne: transaction._id },
      userId: req.user.id,
      amount: numericAmount,
      type,
      date: { $gte: fromTime, $lte: toTime },
      description: normalizedDescription,
    }).lean();

    if (duplicate) {
      return res.status(400).json({ message: "Duplicate transaction detected" });
    }

    transaction.date = normalizedDate;
    transaction.description = normalizedDescription;
    transaction.amount = numericAmount;
    transaction.type = type;
    transaction.category = category || UNCATEGORIZED_LABEL;
    transaction.categorized = !!category;

    await transaction.save();

    return res.json({
      message: "Manual transaction updated successfully",
      transaction: serializeTransaction(transaction),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// =======================
// Upload Bill Image
// =======================
export const uploadBill = async (req, res) => {
  let filePath;
  let uploadedDocument;

  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No bill image uploaded" });
    }

    const userId = req.user.id;
    filePath = req.file.path;
    const contentHash = await getContentHash(filePath);
    const duplicateDocument = await findDuplicateDocument({
      userId,
      documentType: "BILL",
      contentHash,
    });

    if (duplicateDocument) {
      await fs.unlink(filePath).catch(() => {});
      return res.status(409).json({
        message: "Duplicate file upload blocked. This bill was already imported.",
        duplicate: true,
      });
    }

    uploadedDocument = await UploadedDocument.create({
      userId,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      storagePath: filePath,
      mimeType: req.file.mimetype,
      size: req.file.size,
      documentType: "BILL",
      contentHash,
    });

    const ocrText = await extractBillText(filePath);
    const extracted = extractBillDetails(ocrText);

    const finalDescription = (req.body.description || extracted.description || "").trim();
    const finalAmount = req.body.amount ? Number(req.body.amount) : extracted.amount;
    const finalDate = req.body.date ? new Date(req.body.date) : extracted.date;
    const finalType = req.body.type || extracted.type || "DEBIT";

    const missingFields = [];

    if (!finalDescription) {
      missingFields.push("description");
    }

    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      missingFields.push("amount");
    }

    if (!(finalDate instanceof Date) || Number.isNaN(finalDate.getTime())) {
      missingFields.push("date");
    }

    if (!["DEBIT", "CREDIT"].includes(finalType)) {
      missingFields.push("type");
    }

    const category = finalDescription
      ? await detectCategory(finalDescription, finalType, userId)
      : null;

    const lowConfidenceFields = extracted.lowConfidenceFields.filter(
      (field) => !req.body[field],
    );

    if (missingFields.length > 0 || lowConfidenceFields.length > 0) {
      await cleanupUploadedDocument(uploadedDocument, filePath);
      uploadedDocument = null;
      filePath = null;
      return res.status(200).json({
        message: "Bill extracted, but some fields need review",
        needsReview: true,
        missingFields,
        lowConfidenceFields,
        extracted: {
          description: finalDescription || null,
          amount: Number.isFinite(finalAmount) ? finalAmount : null,
          date: finalDate && !Number.isNaN(finalDate.getTime()) ? toIstISOString(finalDate) : null,
          type: ["DEBIT", "CREDIT"].includes(finalType) ? finalType : null,
          category: category || UNCATEGORIZED_LABEL,
          rawText: ocrText,
          fieldConfidence: {
            ...extracted.fieldConfidence,
            ...(req.body.description ? { description: 1 } : {}),
            ...(req.body.amount ? { amount: 1 } : {}),
            ...(req.body.date ? { date: 1, time: extracted.fieldConfidence.time || 0 } : {}),
            ...(req.body.type ? { type: 1 } : {}),
          },
          descriptionCandidates: extracted.descriptionCandidates,
          amountCandidates: extracted.amountCandidates,
        },
      });
    }

    const isDuplicate = await isDuplicateTransaction({
      userId,
      date: finalDate,
      amount: finalAmount,
      description: finalDescription,
      type: finalType,
    });

    if (isDuplicate) {
      await cleanupUploadedDocument(uploadedDocument, filePath);
      uploadedDocument = null;
      filePath = null;
      return res.status(400).json({
        message: "Duplicate transaction detected",
      });
    }

    const transaction = await Transaction.create({
      userId,
      sourceDocumentId: uploadedDocument._id,
      date: finalDate,
      description: finalDescription,
      amount: finalAmount,
      type: finalType,
      category: category || UNCATEGORIZED_LABEL,
      categorized: !!category,
      source: "BILL",
    });

    return res.json({
      message: "Bill processed successfully",
      needsReview: false,
      transaction: serializeTransaction(transaction),
      rawText: ocrText,
      fieldConfidence: extracted.fieldConfidence,
      uploadedDocumentId: uploadedDocument._id,
    });
  } catch (error) {
    console.error("BILL OCR ERROR:", error);
    await cleanupUploadedDocument(uploadedDocument, filePath);
    return res.status(500).json({ message: error.message });
  }
};
