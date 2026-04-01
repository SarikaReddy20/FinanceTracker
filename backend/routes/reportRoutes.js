import express from "express";
import {
  getCategoryReport,
  getMonthlyTrend,
  getIncomeExpense,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/category", protect, getCategoryReport);
router.get("/monthly", protect, getMonthlyTrend);
router.get("/income-expense", protect, getIncomeExpense);

export default router;
