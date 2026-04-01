import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

// 1. Category-wise Expense (Pie Chart)
export const getCategoryReport = async (req, res) => {

  const userId = req.user.id;

  const data = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: "DEBIT"
      }
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" }
      }
    }
  ]);

  res.json(data);
};


// 2. Monthly Trend (Line Chart)
export const getMonthlyTrend = async (req, res) => {

  const userId = req.user.id;

  const data = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id: { $month: "$date" },
        total: { $sum: "$amount" }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  res.json(data);
};


// 3. Income vs Expense
export const getIncomeExpense = async (req, res) => {

  const userId = req.user.id;

  const data = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" }
      }
    }
  ]);

  res.json(data);
};