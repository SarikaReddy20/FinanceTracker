import express from "express";
import {
  getDashboardReport,
  getTrendReport,
  getSummaryReport,
  exportPdfReport,
  getCategoryReport,
  getMonthlyTrend,
  getIncomeExpense,
  getTransactionFeed,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboardReport);
router.get("/summary", protect, getSummaryReport);
router.get("/trend", protect, getTrendReport);
router.get("/export/pdf", protect, exportPdfReport);
router.get("/category", protect, getCategoryReport);
router.get("/monthly", protect, getMonthlyTrend);
router.get("/income-expense", protect, getIncomeExpense);
router.get("/transactions", protect, getTransactionFeed);

export default router;
