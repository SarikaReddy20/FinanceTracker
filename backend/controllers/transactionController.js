import { parsePDF } from "../services/pdfParser.js";
import { extractTransactions } from "../services/transactionExtractor.js";
import { detectCategory } from "../services/categoryService.js";
import { extractMerchant } from "../services/extractMerchant.js";

import Transaction from "../models/Transaction.js";
import MerchantCategory from "../models/MerchantCategory.js";
import { isDuplicateTransaction } from "../utils/duplicateChecker.js";

// =======================
// Upload PDF
// =======================
export const uploadPDF = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;
    const filePath = req.file.path;

    const text = await parsePDF(filePath);
    const transactions = extractTransactions(text);

    const saved = [];
    const duplicates = [];
    const uncategorized = [];

    // 🔥 Prevent duplicates inside same upload
    const seen = new Set();

    for (const t of transactions) {
      const normalizedDate = new Date(t.date);

      // 🔑 Unique key for same-upload detection
      const key = `${t.type}-${t.amount}-${t.description}-${normalizedDate.getTime()}`;

      if (seen.has(key)) {
        duplicates.push({
          description: t.description,
          amount: t.amount,
          date: normalizedDate,
        });
        continue;
      }
      seen.add(key);

      const category = await detectCategory(t.description, t.type, userId);

      // 🔥 DB duplicate check
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
          date: normalizedDate,
        });
        continue;
      }

      const newTransaction = await Transaction.create({
        userId,
        date: normalizedDate,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: category || "Uncategorized",
        categorized: !!category,
        source: "PDF",
      });

      saved.push(newTransaction);

      if (!category) {
        uncategorized.push(newTransaction);
      }
    }

    res.json({
      message: "PDF processed successfully",
      totalAdded: saved.length,
      duplicatesCount: duplicates.length,
      duplicates,
      uncategorized,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// =======================
// Update Category
// =======================
export const updateCategory = async (req, res) => {
  try {
    const { category } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const merchant = extractMerchant(transaction.description);

    if (merchant) {
      await MerchantCategory.create({
        userId: transaction.userId,
        merchant,
        category,
      });
    }

    transaction.category = category;
    transaction.categorized = true;

    await transaction.save();

    res.json(transaction);
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

    const { date, description, amount, type } = req.body;

    if (!date || !description || !amount || !type) {
      return res.status(400).json({ message: "All fields required" });
    }

    const normalizedDate = new Date(date);

    const category = await detectCategory(description, type, userId);

    // 🔥 Duplicate check
    const isDuplicate = await isDuplicateTransaction({
      userId,
      date: normalizedDate,
      amount,
      description,
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
      description,
      amount,
      type,
      category: category || "Uncategorized",
      categorized: !!category,
      source: "MANUAL",
    });

    res.json({
      message: "Transaction added successfully",
      transaction,
    });
  } catch (error) {
    console.error("MANUAL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
