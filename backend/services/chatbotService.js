import Transaction from "../models/Transaction.js";

const SUPPORTED_LANGUAGES = new Set(["en", "hi", "te", "kn"]);
const IST_TIMEZONE = "Asia/Kolkata";

const UI_ROUTES = {
  dashboard: "/dashboard",
  reports: "/reports",
  uploadPdf: "/upload",
  uploadBill: "/upload-bill",
  goals: "/goals",
  settings: "/settings",
};

const TEXT = {
  en: {
    greeting: "Hi! I can help with reports, expenses, uploads, settings, and insights.",
    fallback: "I can help with dashboard, reports, monthly expenses, unusual transactions, and saving suggestions.",
    dashboard: "Opening your dashboard now.",
    reports: "Opening reports now.",
    uploadPdf: "Opening PDF upload now.",
    uploadBill: "Opening bill OCR upload now.",
    settings: "Opening settings now.",
    goals: "Opening goals planner now.",
    noData: "I do not have enough data for that yet.",
    monthSummary: ({ total, topCategory }) => `Your spending this month is Rs ${total.toFixed(2)}. Top category is ${topCategory}.`,
    categorySummary: (items) => `Top spending categories this month: ${items}.`,
    recentExpenses: (items) => `Your latest expenses are: ${items}.`,
    spendingExplain: ({ current, previous, percent, direction, category }) =>
      `You spent ${Math.abs(percent).toFixed(2)}% ${direction} this month (Rs ${current.toFixed(2)}) compared with last month (Rs ${previous.toFixed(2)}), mainly on ${category}.`,
    unusualIntro: "These transactions look unusual:",
    unusualNone: "I did not find any strongly unusual transactions right now.",
    unusualItem: ({ description, amount, category }) => `${description} in ${category} for Rs ${amount.toFixed(2)}.`,
    savingIntro: "Here are smart saving suggestions:",
    savingHint1: ({ category, amount }) => `Review ${category}. It increased by Rs ${amount.toFixed(2)} from the previous month.`,
    savingHint2: ({ category, share }) => `${category} is ${share.toFixed(1)}% of this month spending. A small cut there can help.`,
    quickReplies: [
      "Dashboard",
      "Reports",
      "Monthly expenses",
      "Why did I spend more?",
      "Unusual transactions",
      "Saving suggestions",
    ],
    up: "more",
    down: "less",
  },
  hi: {
    greeting: "\u0928\u092e\u0938\u094d\u0924\u0947! \u092e\u0948\u0902 \u0930\u093f\u092a\u094b\u0930\u094d\u091f, \u0916\u0930\u094d\u091a, \u0905\u092a\u0932\u094b\u0921, \u0938\u0947\u091f\u093f\u0902\u0917\u094d\u0938 \u0914\u0930 \u0907\u0928\u0938\u093e\u0907\u091f\u094d\u0938 \u092e\u0947\u0902 \u092e\u0926\u0926 \u0915\u0930 \u0938\u0915\u0924\u093e \u0939\u0942\u0901.",
    fallback: "\u092e\u0948\u0902 \u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921, \u0930\u093f\u092a\u094b\u0930\u094d\u091f, \u092e\u093e\u0938\u093f\u0915 \u0916\u0930\u094d\u091a, \u0905\u0938\u093e\u092e\u093e\u0928\u094d\u092f \u091f\u094d\u0930\u093e\u0902\u091c\u0948\u0915\u094d\u0936\u0928 \u0914\u0930 \u092c\u091a\u0924 \u0938\u0941\u091d\u093e\u0935\u094b\u0902 \u092e\u0947\u0902 \u092e\u0926\u0926 \u0915\u0930 \u0938\u0915\u0924\u093e \u0939\u0942\u0901.",
    dashboard: "\u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921 \u0916\u094b\u0932 \u0930\u0939\u093e \u0939\u0942\u0901.",
    reports: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0916\u094b\u0932 \u0930\u0939\u093e \u0939\u0942\u0901.",
    uploadPdf: "PDF \u0905\u092a\u0932\u094b\u0921 \u092a\u0947\u091c \u0916\u094b\u0932 \u0930\u0939\u093e \u0939\u0942\u0901.",
    uploadBill: "\u092c\u093f\u0932 OCR \u0905\u092a\u0932\u094b\u0921 \u092a\u0947\u091c \u0916\u094b\u0932 \u0930\u0939\u093e \u0939\u0942\u0901.",
    settings: "\u0938\u0947\u091f\u093f\u0902\u0917\u094d\u0938 \u0916\u094b\u0932 \u0930\u0939\u093e \u0939\u0942\u0901.",
    goals: "\u0917\u094b\u0932 \u092a\u094d\u0932\u093e\u0928\u0930 \u0916\u094b\u0932 \u0930\u0939\u093e \u0939\u0942\u0901.",
    noData: "\u0907\u0938\u0915\u0947 \u0932\u093f\u090f \u0905\u092d\u0940 \u092a\u0930\u094d\u092f\u093e\u092a\u094d\u0924 \u0921\u0947\u091f\u093e \u0928\u0939\u0940\u0902 \u0939\u0948.",
    monthSummary: ({ total, topCategory }) => `\u0907\u0938 \u092e\u0939\u0940\u0928\u0947 \u0906\u092a\u0915\u093e \u0916\u0930\u094d\u091a Rs ${total.toFixed(2)} \u0939\u0948. \u0938\u092c\u0938\u0947 \u092c\u0921\u093c\u0940 \u0915\u0948\u091f\u0947\u0917\u0930\u0940 ${topCategory} \u0939\u0948.`,
    categorySummary: (items) => `\u0907\u0938 \u092e\u0939\u0940\u0928\u0947 \u0915\u0940 \u092a\u094d\u0930\u092e\u0941\u0916 \u0916\u0930\u094d\u091a \u0915\u0948\u091f\u0947\u0917\u0930\u0940: ${items}.`,
    recentExpenses: (items) => `\u0906\u092a\u0915\u0947 \u0939\u093e\u0932 \u0915\u0947 \u0916\u0930\u094d\u091a: ${items}.`,
    spendingExplain: ({ current, previous, percent, direction, category }) =>
      `\u0907\u0938 \u092e\u0939\u0940\u0928\u0947 \u0906\u092a\u0915\u093e \u0916\u0930\u094d\u091a ${Math.abs(percent).toFixed(2)}% ${direction} \u0939\u0948 (Rs ${current.toFixed(2)}), \u092a\u093f\u091b\u0932\u0947 \u092e\u0939\u0940\u0928\u0947 (Rs ${previous.toFixed(2)}) \u0915\u0940 \u0924\u0941\u0932\u0928\u093e \u092e\u0947\u0902, \u092e\u0941\u0916\u094d\u092f \u0930\u0942\u092a \u0938\u0947 ${category} \u092e\u0947\u0902.`,
    unusualIntro: "\u092f\u0947 \u091f\u094d\u0930\u093e\u0902\u091c\u0948\u0915\u094d\u0936\u0928 \u0905\u0938\u093e\u092e\u093e\u0928\u094d\u092f \u0932\u0917 \u0930\u0939\u0947 \u0939\u0948\u0902:",
    unusualNone: "\u0905\u092d\u0940 \u0915\u094b\u0908 \u092c\u0939\u0941\u0924 \u0905\u0938\u093e\u092e\u093e\u0928\u094d\u092f \u091f\u094d\u0930\u093e\u0902\u091c\u0948\u0915\u094d\u0936\u0928 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e.",
    unusualItem: ({ description, amount, category }) => `${description}, ${category} \u092e\u0947\u0902 Rs ${amount.toFixed(2)}.`,
    savingIntro: "\u092f\u0947 \u0938\u094d\u092e\u093e\u0930\u094d\u091f \u092c\u091a\u0924 \u0938\u0941\u091d\u093e\u0935 \u0939\u0948\u0902:",
    savingHint1: ({ category, amount }) => `${category} \u0915\u094b \u0926\u0947\u0916\u0947\u0902. \u092f\u0939 \u092a\u093f\u091b\u0932\u0947 \u092e\u0939\u0940\u0928\u0947 \u0938\u0947 Rs ${amount.toFixed(2)} \u092c\u0922\u093c\u093e \u0939\u0948.`,
    savingHint2: ({ category, share }) => `${category} \u0907\u0938 \u092e\u0939\u0940\u0928\u0947 \u0915\u0947 \u0916\u0930\u094d\u091a \u0915\u093e ${share.toFixed(1)}% \u0939\u0948. \u0907\u0938\u092e\u0947\u0902 \u0925\u094b\u0921\u093c\u0940 \u0915\u091f\u094c\u0924\u0940 \u092e\u0926\u0926 \u0915\u0930\u0947\u0917\u0940.`,
    quickReplies: [
      "\u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921",
      "\u0930\u093f\u092a\u094b\u0930\u094d\u091f",
      "\u092e\u093e\u0938\u093f\u0915 \u0916\u0930\u094d\u091a",
      "\u092e\u0948\u0902\u0928\u0947 \u091c\u094d\u092f\u093e\u0926\u093e \u0915\u094d\u092f\u094b\u0902 \u0916\u0930\u094d\u091a \u0915\u093f\u092f\u093e?",
      "\u0905\u0938\u093e\u092e\u093e\u0928\u094d\u092f \u091f\u094d\u0930\u093e\u0902\u091c\u0948\u0915\u094d\u0936\u0928",
      "\u092c\u091a\u0924 \u0938\u0941\u091d\u093e\u0935",
    ],
    up: "\u091c\u094d\u092f\u093e\u0926\u093e",
    down: "\u0915\u092e",
  },
  te: {
    greeting: "\u0c39\u0c3e\u0c2f\u0c4d! \u0c30\u0c3f\u0c2a\u0c4b\u0c30\u0c4d\u0c1f\u0c41\u0c32\u0c41, \u0c16\u0c30\u0c4d\u0c1a\u0c41\u0c32\u0c41, \u0c05\u0c2a\u0c4d\u0c32\u0c4b\u0c21\u0c4d\u0c32\u0c41, \u0c38\u0c46\u0c1f\u0c4d\u0c1f\u0c3f\u0c02\u0c17\u0c4d\u0c38\u0c4d \u0c2e\u0c30\u0c3f\u0c2f\u0c41 \u0c07\u0c28\u0c4d\u0c38\u0c48\u0c1f\u0c4d\u0c38\u0c4d\u0c32\u0c4b \u0c28\u0c47\u0c28\u0c41 \u0c38\u0c39\u0c3e\u0c2f\u0c02 \u0c1a\u0c47\u0c38\u0c4d\u0c24\u0c3e\u0c28\u0c41.",
    fallback: "\u0c21\u0c4d\u0c2f\u0c3e\u0c37\u0c4d\u0c2c\u0c4b\u0c30\u0c4d\u0c21\u0c4d, \u0c30\u0c3f\u0c2a\u0c4b\u0c30\u0c4d\u0c1f\u0c41\u0c32\u0c41, \u0c28\u0c46\u0c32\u0c35\u0c3e\u0c30\u0c40 \u0c16\u0c30\u0c4d\u0c1a\u0c41\u0c32\u0c41, \u0c05\u0c38\u0c3e\u0c27\u0c3e\u0c30\u0c23 \u0c1f\u0c4d\u0c30\u0c3e\u0c28\u0c4d\u0c38\u0c3e\u0c15\u0c4d\u0c37\u0c28\u0c4d\u0c32\u0c41, \u0c38\u0c47\u0c35\u0c3f\u0c02\u0c17\u0c4d\u0c38\u0c4d \u0c38\u0c42\u0c1a\u0c28\u0c32\u0c4d\u0c32\u0c4b \u0c28\u0c47\u0c28\u0c41 \u0c38\u0c39\u0c3e\u0c2f\u0c02 \u0c1a\u0c47\u0c38\u0c4d\u0c24\u0c3e\u0c28\u0c41.",
    dashboard: "\u0c21\u0c4d\u0c2f\u0c3e\u0c37\u0c4d\u0c2c\u0c4b\u0c30\u0c4d\u0c21\u0c4d \u0c24\u0c46\u0c30\u0c35\u0c41\u0c24\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c28\u0c41.",
    reports: "\u0c30\u0c3f\u0c2a\u0c4b\u0c30\u0c4d\u0c1f\u0c41\u0c32\u0c41 \u0c24\u0c46\u0c30\u0c35\u0c41\u0c24\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c28\u0c41.",
    uploadPdf: "PDF \u0c05\u0c2a\u0c4d\u0c32\u0c4b\u0c21\u0c4d \u0c2a\u0c47\u0c1c\u0c40 \u0c24\u0c46\u0c30\u0c35\u0c41\u0c24\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c28\u0c41.",
    uploadBill: "\u0c2c\u0c3f\u0c32\u0c4d OCR \u0c05\u0c2a\u0c4d\u0c32\u0c4b\u0c21\u0c4d \u0c2a\u0c47\u0c1c\u0c40 \u0c24\u0c46\u0c30\u0c35\u0c41\u0c24\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c28\u0c41.",
    settings: "\u0c38\u0c46\u0c1f\u0c4d\u0c1f\u0c3f\u0c02\u0c17\u0c4d\u0c38\u0c4d \u0c24\u0c46\u0c30\u0c35\u0c41\u0c24\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c28\u0c41.",
    goals: "\u0c17\u0c4b\u0c32\u0c4d\u0c38\u0c4d \u0c2a\u0c4d\u0c32\u0c3e\u0c28\u0c30\u0c4d \u0c24\u0c46\u0c30\u0c35\u0c41\u0c24\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c28\u0c41.",
    noData: "\u0c26\u0c3e\u0c28\u0c3f\u0c15\u0c3f \u0c07\u0c02\u0c15\u0c3e \u0c38\u0c30\u0c3f\u0c2a\u0c21\u0c3e \u0c21\u0c47\u0c1f\u0c3e \u0c32\u0c47\u0c26\u0c41.",
    monthSummary: ({ total, topCategory }) => `\u0c08 \u0c28\u0c46\u0c32 \u0c2e\u0c40 \u0c16\u0c30\u0c4d\u0c1a\u0c41 Rs ${total.toFixed(2)}. \u0c0e\u0c15\u0c4d\u0c15\u0c41\u0c35 \u0c16\u0c30\u0c4d\u0c1a\u0c41 \u0c15\u0c47\u0c1f\u0c17\u0c3f\u0c30\u0c40 ${topCategory}.`,
    categorySummary: (items) => `\u0c08 \u0c28\u0c46\u0c32 \u0c1f\u0c3e\u0c2a\u0c4d \u0c16\u0c30\u0c4d\u0c1a\u0c41 \u0c15\u0c47\u0c1f\u0c17\u0c3f\u0c30\u0c40\u0c32\u0c41: ${items}.`,
    recentExpenses: (items) => `\u0c2e\u0c40 \u0c24\u0c3e\u0c1c\u0c3e \u0c16\u0c30\u0c4d\u0c1a\u0c41\u0c32\u0c41: ${items}.`,
    spendingExplain: ({ current, previous, percent, direction, category }) =>
      `\u0c08 \u0c28\u0c46\u0c32 \u0c2e\u0c40 \u0c16\u0c30\u0c4d\u0c1a\u0c41 ${Math.abs(percent).toFixed(2)}% ${direction} \u0c09\u0c02\u0c26\u0c3f (Rs ${current.toFixed(2)}), \u0c17\u0c24 \u0c28\u0c46\u0c32 (Rs ${previous.toFixed(2)})\u0c24\u0c4b \u0c2a\u0c4b\u0c32\u0c3f\u0c38\u0c4d\u0c24\u0c47, \u0c2e\u0c41\u0c16\u0c4d\u0c2f\u0c02\u0c17\u0c3e ${category} \u0c2a\u0c48.`,
    unusualIntro: "\u0c08 \u0c1f\u0c4d\u0c30\u0c3e\u0c28\u0c4d\u0c38\u0c3e\u0c15\u0c4d\u0c37\u0c28\u0c4d\u0c32\u0c41 \u0c05\u0c38\u0c3e\u0c27\u0c3e\u0c30\u0c23\u0c02\u0c17\u0c3e \u0c15\u0c28\u0c3f\u0c2a\u0c3f\u0c38\u0c4d\u0c24\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c2f\u0c3f:",
    unusualNone: "\u0c2a\u0c4d\u0c30\u0c38\u0c4d\u0c24\u0c41\u0c24\u0c02 \u0c2c\u0c32\u0c2e\u0c48\u0c28 \u0c05\u0c38\u0c3e\u0c27\u0c3e\u0c30\u0c23 \u0c1f\u0c4d\u0c30\u0c3e\u0c28\u0c4d\u0c38\u0c3e\u0c15\u0c4d\u0c37\u0c28\u0c4d\u0c32\u0c41 \u0c15\u0c28\u0c3f\u0c2a\u0c3f\u0c02\u0c1a\u0c32\u0c47\u0c26\u0c41.",
    unusualItem: ({ description, amount, category }) => `${description}, ${category} \u0c32\u0c4b Rs ${amount.toFixed(2)}.`,
    savingIntro: "\u0c38\u0c4d\u0c2e\u0c3e\u0c30\u0c4d\u0c1f\u0c4d \u0c38\u0c47\u0c35\u0c3f\u0c02\u0c17\u0c4d\u0c38\u0c4d \u0c38\u0c42\u0c1a\u0c28\u0c32\u0c41 \u0c07\u0c35\u0c3f:",
    savingHint1: ({ category, amount }) => `${category}\u0c28\u0c3f \u0c2a\u0c30\u0c3f\u0c36\u0c40\u0c32\u0c3f\u0c02\u0c1a\u0c02\u0c21\u0c3f. \u0c07\u0c26\u0c3f \u0c17\u0c24 \u0c28\u0c46\u0c32\u0c24\u0c4b \u0c2a\u0c4b\u0c32\u0c3f\u0c38\u0c4d\u0c24\u0c47 Rs ${amount.toFixed(2)} \u0c2a\u0c46\u0c30\u0c3f\u0c17\u0c3f\u0c02\u0c26\u0c3f.`,
    savingHint2: ({ category, share }) => `${category} \u0c08 \u0c28\u0c46\u0c32 \u0c16\u0c30\u0c4d\u0c1a\u0c41\u0c32\u0c4b ${share.toFixed(1)}% \u0c09\u0c02\u0c26\u0c3f. \u0c05\u0c15\u0c4d\u0c15\u0c21 \u0c1a\u0c3f\u0c28\u0c4d\u0c28 \u0c24\u0c17\u0c4d\u0c17\u0c3f\u0c02\u0c2a\u0c41 \u0c09\u0c2a\u0c2f\u0c4b\u0c17\u0c2a\u0c21\u0c41\u0c24\u0c41\u0c02\u0c26\u0c3f.`,
    quickReplies: [
      "\u0c21\u0c4d\u0c2f\u0c3e\u0c37\u0c4d\u0c2c\u0c4b\u0c30\u0c4d\u0c21\u0c4d",
      "\u0c30\u0c3f\u0c2a\u0c4b\u0c30\u0c4d\u0c1f\u0c41\u0c32\u0c41",
      "\u0c28\u0c46\u0c32\u0c35\u0c3e\u0c30\u0c40 \u0c16\u0c30\u0c4d\u0c1a\u0c41\u0c32\u0c41",
      "\u0c28\u0c47\u0c28\u0c41 \u0c0e\u0c15\u0c4d\u0c15\u0c41\u0c35 \u0c0e\u0c02\u0c26\u0c41\u0c15\u0c41 \u0c16\u0c30\u0c4d\u0c1a\u0c41 \u0c1a\u0c47\u0c36\u0c3e\u0c28\u0c41?",
      "\u0c05\u0c38\u0c3e\u0c27\u0c3e\u0c30\u0c23 \u0c1f\u0c4d\u0c30\u0c3e\u0c28\u0c4d\u0c38\u0c3e\u0c15\u0c4d\u0c37\u0c28\u0c4d\u0c32\u0c41",
      "\u0c38\u0c47\u0c35\u0c3f\u0c02\u0c17\u0c4d\u0c38\u0c4d \u0c38\u0c42\u0c1a\u0c28\u0c32\u0c41",
    ],
    up: "\u0c0e\u0c15\u0c4d\u0c15\u0c41\u0c35",
    down: "\u0c24\u0c15\u0c4d\u0c15\u0c41\u0c35",
  },
  kn: {
    greeting: "\u0cb9\u0cbe\u0caf\u0ccd! \u0cb5\u0cb0\u0ca6\u0cbf\u0c97\u0cb3\u0cc1, \u0c96\u0cb0\u0ccd\u0c9a\u0cc1\u0c97\u0cb3\u0cc1, \u0c85\u0caa\u0ccd\u200c\u0cb2\u0ccb\u0ca1\u0ccd\u200c\u0c97\u0cb3\u0cc1, \u0cb8\u0cc6\u0c9f\u0ccd\u0c9f\u0cbf\u0c82\u0c97\u0ccd\u0cb8\u0ccd \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0c87\u0ca8\u0ccd\u200c\u0cb8\u0cc8\u0c9f\u0ccd\u0cb8\u0ccd\u200c\u0ca8\u0cb2\u0ccd\u0cb2\u0cbf \u0ca8\u0cbe\u0ca8\u0cc1 \u0cb8\u0cb9\u0cbe\u0caf \u0cae\u0cbe\u0ca1\u0cc1\u0ca4\u0ccd\u0ca4\u0cc7\u0ca8\u0cc6.",
    fallback: "\u0ca1\u0ccd\u0caf\u0cbe\u0cb6\u0ccd\u0cac\u0ccb\u0cb0\u0ccd\u0ca1\u0ccd, \u0cb5\u0cb0\u0ca6\u0cbf, \u0cae\u0cbe\u0cb8\u0cbf\u0c95 \u0c96\u0cb0\u0ccd\u0c9a\u0cc1, \u0c85\u0cb8\u0cbe\u0cae\u0cbe\u0ca8\u0ccd\u0caf \u0cb5\u0ccd\u0caf\u0cb5\u0cb9\u0cbe\u0cb0\u0c97\u0cb3\u0cc1 \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0c89\u0cb3\u0cbf\u0ca4\u0cbe\u0caf \u0cb8\u0cb2\u0cb9\u0cc6\u0c97\u0cb3\u0cb2\u0ccd\u0cb2\u0cbf \u0ca8\u0cbe\u0ca8\u0cc1 \u0cb8\u0cb9\u0cbe\u0caf \u0cae\u0cbe\u0ca1\u0cc1\u0ca4\u0ccd\u0ca4\u0cc7\u0ca8\u0cc6.",
    dashboard: "\u0ca1\u0ccd\u0caf\u0cbe\u0cb6\u0ccd\u0cac\u0ccb\u0cb0\u0ccd\u0ca1\u0ccd \u0ca4\u0cc6\u0c97\u0cc6\u0caf\u0cb2\u0cbe\u0c97\u0cc1\u0ca4\u0ccd\u0ca4\u0cbf\u0ca6\u0cc6.",
    reports: "\u0cb5\u0cb0\u0ca6\u0cbf\u0c97\u0cb3\u0cc1 \u0ca4\u0cc6\u0c97\u0cc6\u0caf\u0cb2\u0cbe\u0c97\u0cc1\u0ca4\u0ccd\u0ca4\u0cbf\u0ca6\u0cc6.",
    uploadPdf: "PDF \u0c85\u0caa\u0ccd\u200c\u0cb2\u0ccb\u0ca1\u0ccd \u0caa\u0cc1\u0c9f \u0ca4\u0cc6\u0c97\u0cc6\u0caf\u0cb2\u0cbe\u0c97\u0cc1\u0ca4\u0ccd\u0ca4\u0cbf\u0ca6\u0cc6.",
    uploadBill: "\u0cac\u0cbf\u0cb2\u0ccd OCR \u0c85\u0caa\u0ccd\u200c\u0cb2\u0ccb\u0ca1\u0ccd \u0caa\u0cc1\u0c9f \u0ca4\u0cc6\u0c97\u0cc6\u0caf\u0cb2\u0cbe\u0c97\u0cc1\u0ca4\u0ccd\u0ca4\u0cbf\u0ca6\u0cc6.",
    settings: "\u0cb8\u0cc6\u0c9f\u0ccd\u0c9f\u0cbf\u0c82\u0c97\u0ccd\u0cb8\u0ccd \u0ca4\u0cc6\u0c97\u0cc6\u0caf\u0cb2\u0cbe\u0c97\u0cc1\u0ca4\u0ccd\u0ca4\u0cbf\u0ca6\u0cc6.",
    goals: "\u0c97\u0ccb\u0cb2\u0ccd\u0cb8\u0ccd \u0caa\u0ccd\u0cb2\u0cbe\u0ca8\u0cb0\u0ccd \u0ca4\u0cc6\u0c97\u0cc6\u0caf\u0cb2\u0cbe\u0c97\u0cc1\u0ca4\u0ccd\u0ca4\u0cbf\u0ca6\u0cc6.",
    noData: "\u0c87\u0ca6\u0c95\u0ccd\u0c95\u0cbe\u0c97\u0cbf \u0c87\u0ca8\u0ccd\u0ca8\u0cc2 \u0cb8\u0cbe\u0c95\u0cb7\u0ccd\u0c9f\u0cc1 \u0ca1\u0cc7\u0c9f\u0cbe \u0c87\u0cb2\u0ccd\u0cb2.",
    monthSummary: ({ total, topCategory }) => `\u0c88 \u0ca4\u0cbf\u0c82\u0c97\u0cb3\u0cc1 \u0ca8\u0cbf\u0cae\u0ccd\u0cae \u0c96\u0cb0\u0ccd\u0c9a\u0cc1 Rs ${total.toFixed(2)}. \u0c85\u0ca4\u0cbf \u0cb9\u0cc6\u0c9a\u0ccd\u0c9a\u0cc1 \u0c96\u0cb0\u0ccd\u0c9a\u0cbe\u0ca6 \u0cb5\u0cb0\u0ccd\u0c97 ${topCategory}.`,
    categorySummary: (items) => `\u0c88 \u0ca4\u0cbf\u0c82\u0c97\u0cb3 \u0c9f\u0cbe\u0caa\u0ccd \u0c96\u0cb0\u0ccd\u0c9a\u0cbf\u0ca8 \u0cb5\u0cb0\u0ccd\u0c97\u0c97\u0cb3\u0cc1: ${items}.`,
    recentExpenses: (items) => `\u0ca8\u0cbf\u0cae\u0ccd\u0cae \u0c87\u0ca4\u0ccd\u0ca4\u0cc0\u0c9a\u0cbf\u0ca8 \u0c96\u0cb0\u0ccd\u0c9a\u0cc1\u0c97\u0cb3\u0cc1: ${items}.`,
    spendingExplain: ({ current, previous, percent, direction, category }) =>
      `\u0cb9\u0cbf\u0c82\u0ca6\u0cbf\u0ca8 \u0ca4\u0cbf\u0c82\u0c97\u0cb3\u0cc1 (Rs ${previous.toFixed(2)}) \u0cb9\u0ccb\u0cb2\u0cbf\u0cb8\u0cbf\u0ca6\u0cb0\u0cc6 \u0c88 \u0ca4\u0cbf\u0c82\u0c97\u0cb3\u0cc1 (Rs ${current.toFixed(2)}) \u0ca8\u0cbf\u0cae\u0ccd\u0cae \u0c96\u0cb0\u0ccd\u0c9a\u0cc1 ${Math.abs(percent).toFixed(2)}% ${direction}, \u0cae\u0cc1\u0c96\u0ccd\u0caf\u0cb5\u0cbe\u0c97\u0cbf ${category} \u0ca8\u0cb2\u0ccd\u0cb2\u0cbf.`,
    unusualIntro: "\u0c88 \u0cb5\u0ccd\u0caf\u0cb5\u0cb9\u0cbe\u0cb0\u0c97\u0cb3\u0cc1 \u0c85\u0cb8\u0cbe\u0cae\u0cbe\u0ca8\u0ccd\u0caf\u0cb5\u0cbe\u0c97\u0cbf \u0c95\u0cbe\u0ca3\u0cc1\u0ca4\u0ccd\u0ca4\u0cbf\u0cb5\u0cc6:",
    unusualNone: "\u0c88\u0c97 \u0caf\u0cbe\u0cb5\u0cc1\u0ca6\u0cc7 \u0cac\u0cb2\u0cb5\u0cbe\u0ca6 \u0c85\u0cb8\u0cbe\u0cae\u0cbe\u0ca8\u0ccd\u0caf \u0cb5\u0ccd\u0caf\u0cb5\u0cb9\u0cbe\u0cb0\u0c97\u0cb3\u0cc1 \u0c95\u0cbe\u0ca3\u0cbf\u0cb8\u0cb2\u0cbf\u0cb2\u0ccd\u0cb2.",
    unusualItem: ({ description, amount, category }) => `${description}, ${category} \u0ca8\u0cb2\u0ccd\u0cb2\u0cbf Rs ${amount.toFixed(2)}.`,
    savingIntro: "\u0c87\u0cb5\u0cc1 \u0cb8\u0ccd\u0cae\u0cbe\u0cb0\u0ccd\u0c9f\u0ccd \u0c89\u0cb3\u0cbf\u0ca4\u0cbe\u0caf \u0cb8\u0cb2\u0cb9\u0cc6\u0c97\u0cb3\u0cc1:",
    savingHint1: ({ category, amount }) => `${category} \u0caa\u0cb0\u0cbf\u0cb6\u0cc0\u0cb2\u0cbf\u0cb8\u0cbf. \u0c87\u0ca6\u0cc1 \u0cb9\u0cbf\u0c82\u0ca6\u0cbf\u0ca8 \u0ca4\u0cbf\u0c82\u0c97\u0cb3\u0cbf\u0c97\u0cbf\u0c82\u0ca4 Rs ${amount.toFixed(2)} \u0cb9\u0cc6\u0c9a\u0ccd\u0c9a\u0cbe\u0c97\u0cbf\u0ca6\u0cc6.`,
    savingHint2: ({ category, share }) => `${category} \u0c88 \u0ca4\u0cbf\u0c82\u0c97\u0cb3 \u0c96\u0cb0\u0ccd\u0c9a\u0cbf\u0ca8 ${share.toFixed(1)}% \u0c87\u0ca6\u0cc6. \u0c85\u0cb2\u0ccd\u0cb2\u0cbf \u0cb8\u0ccd\u0cb5\u0cb2\u0ccd\u0caa \u0c95\u0ca1\u0cbf\u0ca4 \u0cb8\u0cb9\u0cbe\u0caf \u0cae\u0cbe\u0ca1\u0cc1\u0ca4\u0ccd\u0ca4\u0ca6\u0cc6.`,
    quickReplies: [
      "\u0ca1\u0ccd\u0caf\u0cbe\u0cb6\u0ccd\u0cac\u0ccb\u0cb0\u0ccd\u0ca1\u0ccd",
      "\u0cb5\u0cb0\u0ca6\u0cbf",
      "\u0cae\u0cbe\u0cb8\u0cbf\u0c95 \u0c96\u0cb0\u0ccd\u0c9a\u0cc1",
      "\u0ca8\u0cbe\u0ca8\u0cc1 \u0cb9\u0cc6\u0c9a\u0ccd\u0c9a\u0cc1 \u0c8f\u0c95\u0cc6 \u0c96\u0cb0\u0ccd\u0c9a\u0cc1 \u0cae\u0cbe\u0ca1\u0cbf\u0ca6\u0cc6?",
      "\u0c85\u0cb8\u0cbe\u0cae\u0cbe\u0ca8\u0ccd\u0caf \u0cb5\u0ccd\u0caf\u0cb5\u0cb9\u0cbe\u0cb0\u0c97\u0cb3\u0cc1",
      "\u0c89\u0cb3\u0cbf\u0ca4\u0cbe\u0caf \u0cb8\u0cb2\u0cb9\u0cc6\u0c97\u0cb3\u0cc1",
    ],
    up: "\u0cb9\u0cc6\u0c9a\u0ccd\u0c9a\u0cc1",
    down: "\u0c95\u0ca1\u0cbf\u0cae\u0cc6",
  },
};

const INTENTS = [
  { type: "dashboard", keywords: ["dashboard", "\u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921", "\u0c21\u0c4d\u0c2f\u0c3e\u0c37\u0c4d\u0c2c\u0c4b\u0c30\u0c4d\u0c21", "\u0ca1\u0ccd\u0caf\u0cbe\u0cb6\u0ccd\u0cac\u0ccb\u0cb0\u0ccd\u0ca1"] },
  { type: "reports", keywords: ["report", "reports", "\u0930\u093f\u092a\u094b\u0930\u094d\u091f", "\u0c30\u0c3f\u0c2a\u0c4b\u0c30\u0c4d\u0c1f", "\u0cb5\u0cb0\u0ca6\u0cbf"] },
  { type: "uploadPdf", keywords: ["pdf", "statement", "\u0938\u094d\u091f\u0947\u091f\u092e\u0947\u0902\u091f", "\u0c38\u0c4d\u0c1f\u0c47\u0c1f\u0c4d\u0c2e\u0c46\u0c02\u0c1f\u0c4d", "\u0cb8\u0ccd\u0c9f\u0cc7\u0c9f\u0ccd\u0cae\u0cc6\u0c82\u0c9f\u0ccd"] },
  { type: "uploadBill", keywords: ["bill", "ocr", "receipt", "\u092c\u093f\u0932", "\u0c2c\u0c3f\u0c32\u0c4d", "\u0cac\u0cbf\u0cb2\u0ccd"] },
  { type: "goals", keywords: ["goal", "planner", "\u0932\u0915\u094d\u0937\u094d\u092f", "\u0c32\u0c15\u0c4d\u0c37\u0c4d\u0c2f\u0c02", "\u0c97\u0cc1\u0cb0\u0cbf"] },
  { type: "settings", keywords: ["settings", "language", "\u0938\u0947\u091f\u093f\u0902\u0917", "\u0c38\u0c46\u0c1f\u0c4d\u0c1f\u0c3f\u0c02\u0c17\u0c4d\u0c38\u0c4d", "\u0cb8\u0cc6\u0c9f\u0ccd\u0c9f\u0cbf\u0c82\u0c97\u0ccd\u0cb8\u0ccd"] },
  { type: "monthlyExpenses", keywords: ["monthly expense", "this month spend", "monthly spending", "\u092e\u093e\u0938\u093f\u0915 \u0916\u0930\u094d\u091a", "\u0c28\u0c46\u0c32\u0c35\u0c3e\u0c30\u0c40 \u0c16\u0c30\u0c4d\u0c1a\u0c41", "\u0cae\u0cbe\u0cb8\u0cbf\u0c95 \u0c96\u0cb0\u0ccd\u0c9a\u0cc1"] },
  { type: "categorySummary", keywords: ["category", "categories", "\u0915\u0948\u091f\u0947\u0917\u0930\u0940", "\u0c15\u0c47\u0c1f\u0c17\u0c3f\u0c30\u0c40", "\u0cb5\u0cb0\u0ccd\u0c97"] },
  { type: "recentExpenses", keywords: ["recent", "latest expense", "\u0939\u093e\u0932 \u0915\u0947 \u0916\u0930\u094d\u091a", "\u0c24\u0c3e\u0c1c\u0c3e \u0c16\u0c30\u0c4d\u0c1a\u0c41\u0c32\u0c41", "\u0c87\u0ca4\u0ccd\u0ca4\u0cc0\u0c9a\u0cbf\u0ca8 \u0c96\u0cb0\u0ccd\u0c9a\u0cc1"] },
  { type: "spendingExplanation", keywords: ["why did i spend more", "spending change", "compare with last month", "\u091c\u094d\u092f\u093e\u0926\u093e \u0915\u094d\u092f\u094b\u0902", "\u0c0e\u0c15\u0c4d\u0c15\u0c41\u0c35 \u0c0e\u0c02\u0c26\u0c41\u0c15\u0c41", "\u0cb9\u0cc6\u0c9a\u0ccd\u0c9a\u0cc1 \u0c8f\u0c95\u0cc6"] },
  { type: "unusualTransactions", keywords: ["unusual", "outlier", "strange expense", "\u0905\u0938\u093e\u092e\u093e\u0928\u094d\u092f", "\u0c05\u0c38\u0c3e\u0c27\u0c3e\u0c30\u0c23", "\u0c85\u0cb8\u0cbe\u0cae\u0cbe\u0ca8\u0ccd\u0caf"] },
  { type: "savingSuggestions", keywords: ["saving suggestion", "how can i save", "save money", "\u092c\u091a\u0924", "\u0c38\u0c47\u0c35\u0c3f\u0c02\u0c17\u0c4d", "\u0c89\u0cb3\u0cbf\u0ca4\u0cbe\u0caf"] },
];

const normalizeLanguage = (language) => (SUPPORTED_LANGUAGES.has(language) ? language : "en");
const getText = (language) => TEXT[normalizeLanguage(language)] || TEXT.en;

const detectIntent = (message) => {
  const normalized = (message || "").toLowerCase().trim();
  for (const intent of INTENTS) {
    if (intent.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) {
      return intent.type;
    }
  }
  return "fallback";
};

const getMonthRange = (dateParts) => {
  const nextMonth = dateParts.month === 12 ? 1 : dateParts.month + 1;
  const nextYear = dateParts.month === 12 ? dateParts.year + 1 : dateParts.year;
  return {
    startDate: new Date(`${dateParts.year}-${String(dateParts.month).padStart(2, "0")}-01T00:00:00+05:30`),
    endDate: new Date(`${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00+05:30`),
  };
};

const getIstDateParts = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
};

const getCurrentAndPreviousMonthRanges = () => {
  const today = getIstDateParts();
  const current = getMonthRange(today);
  const previousMonth = today.month === 1 ? 12 : today.month - 1;
  const previousYear = today.month === 1 ? today.year - 1 : today.year;
  const previous = getMonthRange({ year: previousYear, month: previousMonth });
  return { current, previous };
};

const getMonthlyExpenseSummary = async (userId) => {
  const { current } = getCurrentAndPreviousMonthRanges();
  const [totals, categories, recent] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId, type: "DEBIT", date: { $gte: current.startDate, $lt: current.endDate } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      { $match: { userId, type: "DEBIT", date: { $gte: current.startDate, $lt: current.endDate } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 3 },
    ]),
    Transaction.find({ userId, type: "DEBIT" }).sort({ date: -1 }).limit(3).lean(),
  ]);

  return {
    total: totals[0]?.total || 0,
    topCategory: categories[0]?._id || "Uncategorized",
    topCategories: categories,
    recent,
  };
};

const getSpendingComparisonInsight = async (userId, language) => {
  const text = getText(language);
  const { current, previous } = getCurrentAndPreviousMonthRanges();

  const [currentTotals, previousTotals, currentCategories, previousCategories] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId, type: "DEBIT", date: { $gte: current.startDate, $lt: current.endDate } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      { $match: { userId, type: "DEBIT", date: { $gte: previous.startDate, $lt: previous.endDate } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      { $match: { userId, type: "DEBIT", date: { $gte: current.startDate, $lt: current.endDate } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      { $match: { userId, type: "DEBIT", date: { $gte: previous.startDate, $lt: previous.endDate } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]),
  ]);

  const currentTotal = currentTotals[0]?.total || 0;
  const previousTotal = previousTotals[0]?.total || 0;

  if (currentTotal === 0 && previousTotal === 0) {
    return { reply: text.noData, route: UI_ROUTES.reports };
  }

  const delta = currentTotal - previousTotal;
  const percent = previousTotal === 0 ? 100 : (delta / previousTotal) * 100;
  const direction = delta >= 0 ? text.up : text.down;

  const previousMap = new Map(previousCategories.map((item) => [item._id || "Uncategorized", item.total || 0]));
  let strongestCategory = currentCategories[0]?._id || "Uncategorized";
  let strongestDelta = Number.NEGATIVE_INFINITY;

  for (const item of currentCategories) {
    const category = item._id || "Uncategorized";
    const base = previousMap.get(category) || 0;
    const change = item.total - base;
    if (change > strongestDelta) {
      strongestDelta = change;
      strongestCategory = category;
    }
  }

  return {
    reply: text.spendingExplain({
      current: currentTotal,
      previous: previousTotal,
      percent,
      direction,
      category: strongestCategory,
    }),
    route: UI_ROUTES.reports,
    data: {
      currentExpense: Number(currentTotal.toFixed(2)),
      previousExpense: Number(previousTotal.toFixed(2)),
      change: Number(delta.toFixed(2)),
      strongestCategory,
      strongestChange: Number(strongestDelta.toFixed(2)),
    },
  };
};

const getUnusualTransactionsInsight = async (userId, language) => {
  const text = getText(language);
  const recentTransactions = await Transaction.find({ userId, type: "DEBIT" }).sort({ date: -1 }).limit(60).lean();

  if (recentTransactions.length < 6) {
    return { reply: text.noData, route: UI_ROUTES.dashboard };
  }

  const categoryStats = new Map();
  for (const item of recentTransactions) {
    const category = item.category || "Uncategorized";
    const stats = categoryStats.get(category) || { sum: 0, count: 0 };
    stats.sum += item.amount;
    stats.count += 1;
    categoryStats.set(category, stats);
  }

  const unusual = recentTransactions
    .map((item) => {
      const category = item.category || "Uncategorized";
      const stats = categoryStats.get(category);
      const baseline = stats && stats.count > 1 ? (stats.sum - item.amount) / (stats.count - 1 || 1) : item.amount;
      const ratio = item.amount / Math.max(baseline || 1, 1);
      return { ...item, score: ratio };
    })
    .filter((item) => item.score >= 2.2 && item.amount >= 100)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (!unusual.length) {
    return { reply: text.unusualNone, route: UI_ROUTES.dashboard };
  }

  const lines = unusual.map((item) => text.unusualItem({
    description: item.description,
    amount: item.amount,
    category: item.category || "Uncategorized",
  }));

  return {
    reply: `${text.unusualIntro} ${lines.join(" ")}`,
    route: UI_ROUTES.dashboard,
    data: {
      items: unusual.map((item) => ({
        description: item.description,
        amount: Number(item.amount.toFixed(2)),
        category: item.category || "Uncategorized",
        score: Number(item.score.toFixed(2)),
      })),
    },
  };
};

const getSavingSuggestionsInsight = async (userId, language) => {
  const text = getText(language);
  const comparison = await getSpendingComparisonInsight(userId, language);
  const summary = await getMonthlyExpenseSummary(userId);

  if (!summary.total) {
    return { reply: text.noData, route: UI_ROUTES.reports };
  }

  const suggestions = [];
  if (comparison.data?.strongestCategory && comparison.data?.strongestChange > 0) {
    suggestions.push(text.savingHint1({
      category: comparison.data.strongestCategory,
      amount: comparison.data.strongestChange,
    }));
  }

  const topCategory = summary.topCategories[0];
  if (topCategory) {
    suggestions.push(text.savingHint2({
      category: topCategory._id || "Uncategorized",
      share: (topCategory.total / summary.total) * 100,
    }));
  }

  if (!suggestions.length) {
    return { reply: text.noData, route: UI_ROUTES.reports };
  }

  return {
    reply: `${text.savingIntro} ${suggestions.join(" ")}`,
    route: UI_ROUTES.reports,
    data: { suggestions },
  };
};

export const buildChatbotReply = async ({ userId, message, preferredLanguage }) => {
  const language = normalizeLanguage(preferredLanguage);
  const text = getText(language);
  const intent = detectIntent(message);

  if (!message?.trim()) {
    return {
      reply: text.greeting,
      route: UI_ROUTES.dashboard,
      quickReplies: text.quickReplies,
    };
  }

  switch (intent) {
    case "dashboard":
      return { reply: text.dashboard, route: UI_ROUTES.dashboard };
    case "reports":
      return { reply: text.reports, route: UI_ROUTES.reports };
    case "uploadPdf":
      return { reply: text.uploadPdf, route: UI_ROUTES.uploadPdf };
    case "uploadBill":
      return { reply: text.uploadBill, route: UI_ROUTES.uploadBill };
    case "goals":
      return { reply: text.goals, route: UI_ROUTES.goals };
    case "settings":
      return { reply: text.settings, route: UI_ROUTES.settings };
    case "monthlyExpenses": {
      const summary = await getMonthlyExpenseSummary(userId);
      if (!summary.total) {
        return { reply: text.noData, route: UI_ROUTES.reports };
      }
      return { reply: text.monthSummary(summary), route: UI_ROUTES.reports };
    }
    case "categorySummary": {
      const summary = await getMonthlyExpenseSummary(userId);
      const items = summary.topCategories.length
        ? summary.topCategories.map((item) => `${item._id || "Uncategorized"} (Rs ${item.total.toFixed(2)})`).join(", ")
        : text.noData;
      return { reply: text.categorySummary(items), route: UI_ROUTES.reports };
    }
    case "recentExpenses": {
      const summary = await getMonthlyExpenseSummary(userId);
      const items = summary.recent.length
        ? summary.recent.map((item) => `${item.description} - Rs ${item.amount.toFixed(2)}`).join(", ")
        : text.noData;
      return { reply: text.recentExpenses(items), route: UI_ROUTES.dashboard };
    }
    case "spendingExplanation":
      return getSpendingComparisonInsight(userId, language);
    case "unusualTransactions":
      return getUnusualTransactionsInsight(userId, language);
    case "savingSuggestions":
      return getSavingSuggestionsInsight(userId, language);
    default:
      return {
        reply: text.fallback,
        route: UI_ROUTES.dashboard,
        quickReplies: text.quickReplies,
      };
  }
};
