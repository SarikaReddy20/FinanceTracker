import { parsePDF } from "../services/pdfParser.js";
import { extractTransactions } from "../services/transactionExtractor.js";
import { detectCategory } from "../services/categoryService.js";
import { extractMerchant } from "../services/extractMerchant.js";

import Transaction from "../models/Transaction.js";
import MerchantCategory from "../models/MerchantCategory.js";

// Upload PDF
export const uploadPDF = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id; // ✅ FIX

    const filePath = req.file.path;

    const text = await parsePDF(filePath);

    const transactions = extractTransactions(text);

    const uncategorized = [];
    const saved = [];

    for (const t of transactions) {
      const category = await detectCategory(
        t.description,
        t.type,
        userId, // ✅ FIX
      );

      const newTransaction = await Transaction.create({
        userId,
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: category ? category : "Uncategorized",
        categorized: !!category,
      });

      saved.push(newTransaction);

      if (!category) {
        uncategorized.push(newTransaction);
      }
    }

    res.json({
      message: "PDF processed successfully",
      total: saved.length,
      uncategorized,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error); // ✅ IMPORTANT
    res.status(500).json({ message: error.message });
  }
};

// Update category + save memory
export const updateCategory = async (req, res) => {
  const { category } = req.body;

  const transaction = await Transaction.findById(req.params.id);

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
};
