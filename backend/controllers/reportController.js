import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import Transaction from "../models/Transaction.js";
import { serializeTransactions } from "../utils/dateFormatter.js";

const IST_TIMEZONE = "Asia/Kolkata";
const VALID_GRANULARITIES = new Set(["day", "week", "month", "year"]);

const getIstToday = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(now);
};

const parseDateRange = (start, end) => {
  const today = getIstToday();
  const fallbackEnd = end || today;
  const fallbackStart = start || `${today.slice(0, 8)}01`;

  const startDate = new Date(`${fallbackStart}T00:00:00+05:30`);
  const endDate = new Date(`${fallbackEnd}T23:59:59.999+05:30`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  return {
    startDate,
    endDate,
    startLabel: fallbackStart,
    endLabel: fallbackEnd,
  };
};

const getMatchStage = (userId, startDate, endDate, type) => ({
  userId: new mongoose.Types.ObjectId(userId),
  ...(type ? { type } : {}),
  date: {
    $gte: startDate,
    $lte: endDate,
  },
});

const getPeriodKeyExpression = (granularity) => {
  switch (granularity) {
    case "day":
      return {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$date",
          timezone: IST_TIMEZONE,
        },
      };
    case "week":
      return {
        $concat: [
          { $toString: { $isoWeekYear: { date: "$date", timezone: IST_TIMEZONE } } },
          "-W",
          {
            $cond: [
              { $lt: [{ $isoWeek: { date: "$date", timezone: IST_TIMEZONE } }, 10] },
              {
                $concat: [
                  "0",
                  { $toString: { $isoWeek: { date: "$date", timezone: IST_TIMEZONE } } },
                ],
              },
              { $toString: { $isoWeek: { date: "$date", timezone: IST_TIMEZONE } } },
            ],
          },
        ],
      };
    case "month":
      return {
        $dateToString: {
          format: "%Y-%m",
          date: "$date",
          timezone: IST_TIMEZONE,
        },
      };
    case "year":
      return {
        $dateToString: {
          format: "%Y",
          date: "$date",
          timezone: IST_TIMEZONE,
        },
      };
    default:
      return {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$date",
          timezone: IST_TIMEZONE,
        },
      };
  }
};

const getTrendData = async ({ userId, startDate, endDate, granularity = "day" }) => {
  const periodKey = getPeriodKeyExpression(granularity);

  const rows = await Transaction.aggregate([
    {
      $match: getMatchStage(userId, startDate, endDate),
    },
    {
      $group: {
        _id: periodKey,
        expense: {
          $sum: {
            $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0],
          },
        },
        income: {
          $sum: {
            $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((row) => ({
    period: row._id,
    expense: Number(row.expense.toFixed(2)),
    income: Number(row.income.toFixed(2)),
    net: Number((row.income - row.expense).toFixed(2)),
  }));
};

const getPeriodComparison = async ({ userId, startDate, endDate }) => {
  const rangeLength = endDate.getTime() - startDate.getTime();
  const previousEnd = new Date(startDate.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - rangeLength);

  const [current, previous] = await Promise.all([
    Transaction.aggregate([
      {
        $match: getMatchStage(userId, startDate, endDate, "DEBIT"),
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),
    Transaction.aggregate([
      {
        $match: getMatchStage(userId, previousStart, previousEnd, "DEBIT"),
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  const currentTotal = current[0]?.total || 0;
  const previousTotal = previous[0]?.total || 0;
  const change = currentTotal - previousTotal;
  const changePercent = previousTotal === 0
    ? (currentTotal > 0 ? 100 : 0)
    : (change / previousTotal) * 100;

  return {
    current: Number(currentTotal.toFixed(2)),
    previous: Number(previousTotal.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    trend: change > 0 ? "up" : change < 0 ? "down" : "flat",
  };
};

const getSummaryPayload = async ({ userId, startDate, endDate }) => {
  const [categoryBreakdown, totals, daily, weekly, monthly, yearly, comparison, recentTransactions] =
    await Promise.all([
      Transaction.aggregate([
        {
          $match: getMatchStage(userId, startDate, endDate, "DEBIT"),
        },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Transaction.aggregate([
        {
          $match: getMatchStage(userId, startDate, endDate),
        },
        {
          $group: {
            _id: null,
            totalIncome: {
              $sum: {
                $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0],
              },
            },
            totalExpense: {
              $sum: {
                $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0],
              },
            },
            transactionsCount: { $sum: 1 },
          },
        },
      ]),
      getTrendData({ userId, startDate, endDate, granularity: "day" }),
      getTrendData({ userId, startDate, endDate, granularity: "week" }),
      getTrendData({ userId, startDate, endDate, granularity: "month" }),
      getTrendData({ userId, startDate, endDate, granularity: "year" }),
      getPeriodComparison({ userId, startDate, endDate }),
      Transaction.find(getMatchStage(userId, startDate, endDate))
        .sort({ date: -1 })
        .limit(6)
        .lean(),
    ]);

  const totalExpense = totals[0]?.totalExpense || 0;
  const totalIncome = totals[0]?.totalIncome || 0;
  const transactionsCount = totals[0]?.transactionsCount || 0;

  const categories = categoryBreakdown.map((item) => ({
    category: item._id || "Uncategorized",
    total: Number(item.total.toFixed(2)),
    percentage: totalExpense > 0
      ? Number(((item.total / totalExpense) * 100).toFixed(2))
      : 0,
  }));

  return {
    totals: {
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpense: Number(totalExpense.toFixed(2)),
      balance: Number((totalIncome - totalExpense).toFixed(2)),
      transactionsCount,
    },
    categories,
    summaries: {
      daily,
      weekly,
      monthly,
      yearly,
    },
    comparison,
    recentTransactions: serializeTransactions(recentTransactions),
    insights: {
      topCategory: categories[0]?.category || "No spending data",
      topCategorySpend: categories[0]?.total || 0,
      averageDailySpend: daily.length
        ? Number((totalExpense / daily.length).toFixed(2))
        : 0,
    },
  };
};

export const getDashboardReport = async (req, res) => {
  try {
    const range = parseDateRange(req.query.start, req.query.end);

    if (!range) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const payload = await getSummaryPayload({
      userId: req.user.id,
      startDate: range.startDate,
      endDate: range.endDate,
    });

    return res.json({
      range: {
        start: range.startLabel,
        end: range.endLabel,
      },
      ...payload,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getTrendReport = async (req, res) => {
  try {
    const range = parseDateRange(req.query.start, req.query.end);
    const granularity = VALID_GRANULARITIES.has(req.query.granularity)
      ? req.query.granularity
      : "day";

    if (!range) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const data = await getTrendData({
      userId: req.user.id,
      startDate: range.startDate,
      endDate: range.endDate,
      granularity,
    });

    return res.json({
      granularity,
      range: {
        start: range.startLabel,
        end: range.endLabel,
      },
      data,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSummaryReport = async (req, res) => {
  try {
    const range = parseDateRange(req.query.start, req.query.end);

    if (!range) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const payload = await getSummaryPayload({
      userId: req.user.id,
      startDate: range.startDate,
      endDate: range.endDate,
    });

    return res.json({
      range: {
        start: range.startLabel,
        end: range.endLabel,
      },
      ...payload,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const exportPdfReport = async (req, res) => {
  try {
    const range = parseDateRange(req.query.start, req.query.end);

    if (!range) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const payload = await getSummaryPayload({
      userId: req.user.id,
      startDate: range.startDate,
      endDate: range.endDate,
    });

    const doc = new PDFDocument({ margin: 40 });
    const fileName = `spendsmart-report-${range.startLabel}-to-${range.endLabel}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    doc.pipe(res);

    doc.fontSize(22).fillColor("#0f5132").text("SpendSmart Financial Report");
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#444").text(`Range: ${range.startLabel} to ${range.endLabel}`);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN", { timeZone: IST_TIMEZONE })}`);

    doc.moveDown();
    doc.fontSize(15).fillColor("#0f5132").text("Summary");
    doc.fontSize(11).fillColor("#111");
    doc.text(`Total Income: Rs ${payload.totals.totalIncome.toFixed(2)}`);
    doc.text(`Total Expense: Rs ${payload.totals.totalExpense.toFixed(2)}`);
    doc.text(`Balance: Rs ${payload.totals.balance.toFixed(2)}`);
    doc.text(`Transactions: ${payload.totals.transactionsCount}`);

    doc.moveDown();
    doc.fontSize(15).fillColor("#0f5132").text("Category Breakdown");
    doc.fontSize(11).fillColor("#111");
    payload.categories.forEach((item) => {
      doc.text(`${item.category}: Rs ${item.total.toFixed(2)} (${item.percentage.toFixed(2)}%)`);
    });

    doc.moveDown();
    doc.fontSize(15).fillColor("#0f5132").text("Period Comparison");
    doc.fontSize(11).fillColor("#111");
    doc.text(`Current Period Expense: Rs ${payload.comparison.current.toFixed(2)}`);
    doc.text(`Previous Period Expense: Rs ${payload.comparison.previous.toFixed(2)}`);
    doc.text(`Change: Rs ${payload.comparison.change.toFixed(2)} (${payload.comparison.changePercent.toFixed(2)}%)`);

    doc.moveDown();
    doc.fontSize(15).fillColor("#0f5132").text("Insights");
    doc.fontSize(11).fillColor("#111");
    doc.text(`Top Category: ${payload.insights.topCategory}`);
    doc.text(`Top Category Spend: Rs ${payload.insights.topCategorySpend.toFixed(2)}`);
    doc.text(`Average Daily Spend: Rs ${payload.insights.averageDailySpend.toFixed(2)}`);

    doc.end();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCategoryReport = async (req, res) => {
  const range = parseDateRange(req.query.start, req.query.end);
  if (!range) {
    return res.status(400).json({ message: "Invalid date range" });
  }

  const payload = await getSummaryPayload({
    userId: req.user.id,
    startDate: range.startDate,
    endDate: range.endDate,
  });

  return res.json(payload.categories.map((item) => ({
    _id: item.category,
    total: item.total,
    percentage: item.percentage,
  })));
};

export const getMonthlyTrend = async (req, res) => {
  const range = parseDateRange(req.query.start, req.query.end);
  if (!range) {
    return res.status(400).json({ message: "Invalid date range" });
  }

  const data = await getTrendData({
    userId: req.user.id,
    startDate: range.startDate,
    endDate: range.endDate,
    granularity: "month",
  });

  return res.json(data.map((item) => ({
    _id: item.period,
    total: item.expense,
  })));
};

export const getIncomeExpense = async (req, res) => {
  const range = parseDateRange(req.query.start, req.query.end);
  if (!range) {
    return res.status(400).json({ message: "Invalid date range" });
  }

  const payload = await getSummaryPayload({
    userId: req.user.id,
    startDate: range.startDate,
    endDate: range.endDate,
  });

  return res.json([
    { _id: "CREDIT", total: payload.totals.totalIncome },
    { _id: "DEBIT", total: payload.totals.totalExpense },
  ]);
};
