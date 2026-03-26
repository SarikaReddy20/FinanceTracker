import { parsePDF } from "../services/pdfParser.js";
import { extractTransactions } from "../services/transactionExtractor.js";
import { detectCategory } from "../services/categoryService.js";
import { extractMerchant } from "../services/extractMerchant.js";

import Transaction from "../models/Transaction.js";
import MerchantCategory from "../models/MerchantCategory.js";

// Upload PDF
export const uploadPDF = async (req, res) => {
  try {
    const filePath = req.file.path;

    const text = await parsePDF(filePath);

    const transactions = extractTransactions(text);

    const uncategorized = [];
    const saved = [];

    for (const t of transactions) {
      const category = await detectCategory(
        t.description,
        t.type,
        req.body.userId,
      );

      const newTransaction = await Transaction.create({
        userId: req.body.userId,
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: category ? category : "Uncategorized",
        categorized: category ? true : false,
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
    res.status(500).json({ error: error.message });
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
