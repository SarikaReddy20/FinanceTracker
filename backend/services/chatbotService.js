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

const STRINGS = {
  en: {
    greeting: "Hi! I can help you with reports, expenses, uploads, settings, spending changes, and unusual transactions.",
    fallback: "I can help with monthly expenses, reports, dashboard, PDF upload, bill OCR, language settings, spending comparisons, and unusual transactions.",
    dashboard: "Opening your dashboard. It shows insights, category summaries, and recent transactions.",
    reports: "Opening reports. You can compare date ranges, trends, category share, and export a PDF report there.",
    uploadPdf: "Opening PDF upload. Use it to import bank statements and automatically track transactions.",
    uploadBill: "Opening bill OCR. Use it to scan receipts and extract expense details from images.",
    settings: "Opening settings. You can change your language there any time without affecting your saved data.",
    goals: "Opening your saving planner. Add a goal to see how much you need to save every month.",
    monthSummary: ({ total, topCategory }) =>
      `Your spending this month is Rs ${total.toFixed(2)}. Top category: ${topCategory}.`,
    categorySummary: (items) => `Top spending categories this month: ${items}.`,
    recentExpenses: (items) => `Here are your latest expenses: ${items}.`,
    budgetFaq: "Budgets are not added yet, but reports already show your totals, trends, and category breakdown.",
    reportsFaq: "Reports support daily, weekly, monthly, yearly, and custom date-range analysis with charts and PDF export.",
    noData: "I do not have enough expense data yet for that insight.",
    spendingExplain: ({ current, previous, trendWord, delta, percent, topReason }) =>
      `You spent Rs ${current.toFixed(2)} this month versus Rs ${previous.toFixed(2)} last month. That is ${trendWord} by Rs ${Math.abs(delta).toFixed(2)} (${Math.abs(percent).toFixed(2)}%). ${topReason}`,
    topReasonIncrease: ({ category, change }) =>
      `The biggest increase came from ${category}, which changed by Rs ${Math.abs(change).toFixed(2)} compared with last month.`,
    topReasonDecrease: ({ category, change }) =>
      `The biggest drop came from ${category}, which changed by Rs ${Math.abs(change).toFixed(2)} compared with last month.`,
    unusualIntro: "I found these unusual expenses based on your recent spending pattern:",
    unusualNone: "I could not find any strongly unusual expenses right now.",
    unusualItem: ({ description, amount, category, score }) =>
      `${description} in ${category} for Rs ${amount.toFixed(2)} looks unusual (${score}x your usual level).`,
    savingsIntro: "Here are smart saving suggestions based on your recent spending:",
    savingsNone: "I do not have enough data yet to generate meaningful saving suggestions.",
    savingsCategorySpike: ({ category, amount }) =>
      `Review your ${category} spending first. It increased by Rs ${amount.toFixed(2)} compared with last month.`,
    savingsTopCategory: ({ category, share }) =>
      `${category} is taking about ${share.toFixed(1)}% of your current month expenses, so even a small cut there could help.`,
    savingsUnusual: ({ description, amount }) =>
      `Double-check ${description} for Rs ${amount.toFixed(2)} because it looks higher than your usual pattern.`,
  },
  hi: {
    greeting: "नमस्ते! मैं रिपोर्ट, खर्च, अपलोड, सेटिंग्स, खर्च तुलना और असामान्य ट्रांजैक्शन्स में मदद कर सकता हूँ।",
    fallback: "मैं मासिक खर्च, रिपोर्ट, डैशबोर्ड, PDF अपलोड, बिल OCR, भाषा सेटिंग्स, खर्च तुलना और असामान्य ट्रांजैक्शन्स में मदद कर सकता हूँ।",
    dashboard: "डैशबोर्ड खोला जा रहा है। यहाँ इनसाइट्स, कैटेगरी सारांश और हाल की ट्रांजैक्शन्स दिखती हैं।",
    reports: "रिपोर्ट्स खोली जा रही हैं। वहाँ आप डेट रेंज, ट्रेंड, कैटेगरी शेयर और PDF एक्सपोर्ट देख सकते हैं।",
    uploadPdf: "PDF अपलोड खोला जा रहा है। इसका उपयोग बैंक स्टेटमेंट इम्पोर्ट करने के लिए करें।",
    uploadBill: "बिल OCR खोला जा रहा है। इसका उपयोग रसीद की इमेज से खर्च की जानकारी निकालने के लिए करें।",
    settings: "सेटिंग्स खोली जा रही हैं। आप वहाँ कभी भी भाषा बदल सकते हैं।",
    monthSummary: ({ total, topCategory }) =>
      `इस महीने आपका खर्च Rs ${total.toFixed(2)} है। सबसे अधिक खर्च वाली कैटेगरी: ${topCategory}।`,
    categorySummary: (items) => `इस महीने की प्रमुख खर्च कैटेगरी: ${items}।`,
    recentExpenses: (items) => `आपके हाल के खर्च: ${items}।`,
    budgetFaq: "बजट फीचर अभी नहीं जोड़ा गया है, लेकिन रिपोर्ट्स में कुल खर्च, ट्रेंड और कैटेगरी ब्रेकडाउन मौजूद है।",
    reportsFaq: "रिपोर्ट्स में दैनिक, साप्ताहिक, मासिक, वार्षिक और कस्टम डेट रेंज विश्लेषण, चार्ट और PDF एक्सपोर्ट उपलब्ध हैं।",
    noData: "इस जानकारी के लिए अभी पर्याप्त खर्च डेटा नहीं है।",
    spendingExplain: ({ current, previous, trendWord, delta, percent, topReason }) =>
      `इस महीने आपका खर्च Rs ${current.toFixed(2)} है जबकि पिछले महीने Rs ${previous.toFixed(2)} था। यह Rs ${Math.abs(delta).toFixed(2)} (${Math.abs(percent).toFixed(2)}%) ${trendWord} है। ${topReason}`,
    topReasonIncrease: ({ category, change }) =>
      `सबसे बड़ा बढ़ाव ${category} में रहा, जो पिछले महीने की तुलना में Rs ${Math.abs(change).toFixed(2)} बदला।`,
    topReasonDecrease: ({ category, change }) =>
      `सबसे बड़ी कमी ${category} में रही, जो पिछले महीने की तुलना में Rs ${Math.abs(change).toFixed(2)} बदला।`,
    unusualIntro: "आपके हाल के पैटर्न के आधार पर ये खर्च असामान्य लग रहे हैं:",
    unusualNone: "अभी कोई बहुत असामान्य खर्च नहीं मिला।",
    unusualItem: ({ description, amount, category, score }) =>
      `${description}, ${category} में Rs ${amount.toFixed(2)} का खर्च असामान्य लगता है (${score}x सामान्य स्तर)।`,
  },
  te: {
    greeting: "హాయ్! నేను రిపోర్ట్స్, ఖర్చులు, అప్లోడ్స్, సెట్టింగ్స్, ఖర్చు పోలికలు మరియు అసాధారణ ట్రాన్సాక్షన్లలో సహాయం చేస్తాను.",
    fallback: "నేను నెలవారీ ఖర్చులు, రిపోర్ట్స్, డాష్‌బోర్డ్, PDF అప్లోడ్, బిల్ OCR, భాషా సెట్టింగ్స్, ఖర్చు పోలికలు మరియు అసాధారణ ట్రాన్సాక్షన్లలో సహాయం చేయగలను.",
    dashboard: "డాష్‌బోర్డ్ తెరవబడుతోంది. ఇందులో ఇన్‌సైట్స్, కేటగిరీ సమరీలు, తాజా ట్రాన్సాక్షన్లు ఉంటాయి.",
    reports: "రిపోర్ట్స్ తెరవబడుతున్నాయి. అక్కడ తేదీ పరిధులు, ట్రెండ్స్, కేటగిరీ షేర్, PDF ఎక్స్‌పోర్ట్ చూడవచ్చు.",
    uploadPdf: "PDF అప్లోడ్ తెరవబడుతోంది. బ్యాంక్ స్టేట్‌మెంట్‌ను ఇంపోర్ట్ చేయడానికి దీనిని ఉపయోగించండి.",
    uploadBill: "బిల్ OCR తెరవబడుతోంది. బిల్లుల ఇమేజ్‌ల నుంచి వివరాలు తీసుకోవడానికి దీనిని ఉపయోగించండి.",
    settings: "సెట్టింగ్స్ తెరవబడుతున్నాయి. అక్కడ మీరు ఎప్పుడైనా భాష మార్చవచ్చు.",
    monthSummary: ({ total, topCategory }) =>
      `ఈ నెల మీ ఖర్చు Rs ${total.toFixed(2)}. ఎక్కువ ఖర్చు అయిన కేటగిరీ: ${topCategory}.`,
    categorySummary: (items) => `ఈ నెల ఎక్కువ ఖర్చైన కేటగిరీలు: ${items}.`,
    recentExpenses: (items) => `మీ తాజా ఖర్చులు ఇవి: ${items}.`,
    budgetFaq: "బడ్జెట్ ఫీచర్ ఇంకా లేదు, కానీ రిపోర్ట్స్‌లో మొత్తం ఖర్చు, ట్రెండ్స్, కేటగిరీ వివరాలు ఉన్నాయి.",
    reportsFaq: "రిపోర్ట్స్‌లో డైలీ, వీక్లీ, మంత్లీ, ఇయర్లీ, కస్టమ్ తేదీ పరిధి విశ్లేషణతో పాటు చార్ట్స్ మరియు PDF ఎక్స్‌పోర్ట్ ఉంది.",
    noData: "ఈ సమాచారం కోసం సరిపడా ఖర్చు డేటా ఇంకా లేదు.",
    spendingExplain: ({ current, previous, trendWord, delta, percent, topReason }) =>
      `ఈ నెల మీరు Rs ${current.toFixed(2)} ఖర్చు చేశారు, గత నెల Rs ${previous.toFixed(2)}. ఇది Rs ${Math.abs(delta).toFixed(2)} (${Math.abs(percent).toFixed(2)}%) ${trendWord}. ${topReason}`,
    topReasonIncrease: ({ category, change }) =>
      `అత్యధిక పెరుగుదల ${category} లో వచ్చింది, ఇది గత నెలతో పోల్చితే Rs ${Math.abs(change).toFixed(2)} మారింది.`,
    topReasonDecrease: ({ category, change }) =>
      `అత్యధిక తగ్గుదల ${category} లో వచ్చింది, ఇది గత నెలతో పోల్చితే Rs ${Math.abs(change).toFixed(2)} మారింది.`,
    unusualIntro: "మీ ఇటీవలి ఖర్చు ప్యాటర్న్ ఆధారంగా ఇవి అసాధారణంగా కనిపిస్తున్నాయి:",
    unusualNone: "ప్రస్తుతం బలంగా అసాధారణమైన ఖర్చులు కనిపించలేదు.",
    unusualItem: ({ description, amount, category, score }) =>
      `${category} లో ${description} కోసం Rs ${amount.toFixed(2)} అసాధారణంగా ఉంది (${score}x సాధారణ స్థాయి).`,
  },
  kn: {
    greeting: "ಹಾಯ್! ವರದಿಗಳು, ಖರ್ಚುಗಳು, ಅಪ್ಲೋಡ್‌ಗಳು, ಸೆಟ್ಟಿಂಗ್ಸ್, ಖರ್ಚು ಹೋಲಿಕೆಗಳು ಮತ್ತು ಅಸಾಮಾನ್ಯ ವಹಿವಾಟುಗಳಲ್ಲಿ ನಾನು ಸಹಾಯ ಮಾಡಬಹುದು.",
    fallback: "ನಾನು ಮಾಸಿಕ ಖರ್ಚು, ವರದಿಗಳು, ಡ್ಯಾಶ್‌ಬೋರ್ಡ್, PDF ಅಪ್ಲೋಡ್, ಬಿಲ್ OCR, ಭಾಷಾ ಸೆಟ್ಟಿಂಗ್ಸ್, ಖರ್ಚು ಹೋಲಿಕೆಗಳು ಮತ್ತು ಅಸಾಮಾನ್ಯ ವಹಿವಾಟುಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಹುದು.",
    dashboard: "ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯುತ್ತಿದೆ. ಇಲ್ಲಿ ಇನ್ಸೈಟ್ಸ್, ವರ್ಗ ಸಾರಾಂಶಗಳು ಮತ್ತು ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು ಇರುತ್ತವೆ.",
    reports: "ವರದಿಗಳು ತೆರೆಯುತ್ತಿವೆ. ಅಲ್ಲಿ ದಿನಾಂಕ ವ್ಯಾಪ್ತಿ, ಟ್ರೆಂಡ್ಸ್, ವರ್ಗ ಶೇರ್ ಮತ್ತು PDF ಎಕ್ಸ್‌ಪೋರ್ಟ್ ನೋಡಬಹುದು.",
    uploadPdf: "PDF ಅಪ್ಲೋಡ್ ತೆರೆಯುತ್ತಿದೆ. ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್ಮೆಂಟ್ ಆಮದು ಮಾಡಲು ಇದನ್ನು ಬಳಸಿ.",
    uploadBill: "ಬಿಲ್ OCR ತೆರೆಯುತ್ತಿದೆ. ರಸೀದಿ ಚಿತ್ರಗಳಿಂದ ಖರ್ಚಿನ ವಿವರಗಳನ್ನು ಪಡೆಯಲು ಇದನ್ನು ಬಳಸಿ.",
    settings: "ಸೆಟ್ಟಿಂಗ್ಸ್ ತೆರೆಯುತ್ತಿದೆ. ಅಲ್ಲಿ ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ಭಾಷೆ ಬದಲಾಯಿಸಬಹುದು.",
    monthSummary: ({ total, topCategory }) =>
      `ಈ ತಿಂಗಳ ನಿಮ್ಮ ಖರ್ಚು Rs ${total.toFixed(2)}. ಅತಿ ಹೆಚ್ಚು ಖರ್ಚಾದ ವರ್ಗ: ${topCategory}.`,
    categorySummary: (items) => `ಈ ತಿಂಗಳ ಪ್ರಮುಖ ಖರ್ಚಿನ ವರ್ಗಗಳು: ${items}.`,
    recentExpenses: (items) => `ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಖರ್ಚುಗಳು: ${items}.`,
    budgetFaq: "ಬಜೆಟ್ ವೈಶಿಷ್ಟ್ಯ ಇನ್ನೂ ಸೇರಿಸಲಿಲ್ಲ, ಆದರೆ ವರದಿಗಳಲ್ಲಿ ಒಟ್ಟು ಖರ್ಚು, ಟ್ರೆಂಡ್ಸ್ ಮತ್ತು ವರ್ಗ ವಿಭಜನೆ ಈಗಾಗಲೇ ಇದೆ.",
    reportsFaq: "ವರದಿಗಳಲ್ಲಿ ದೈನಂದಿನ, ವಾರದ, ಮಾಸಿಕ, ವಾರ್ಷಿಕ ಹಾಗೂ ಕಸ್ಟಮ್ ದಿನಾಂಕ ವ್ಯಾಪ್ತಿ ವಿಶ್ಲೇಷಣೆ, ಚಾರ್ಟ್‌ಗಳು ಮತ್ತು PDF ಎಕ್ಸ್‌ಪೋರ್ಟ್ ಇದೆ.",
    noData: "ಈ ಮಾಹಿತಿ ನೀಡಲು ಸಾಕಷ್ಟು ಖರ್ಚಿನ ಡೇಟಾ ಇನ್ನೂ ಇಲ್ಲ.",
    spendingExplain: ({ current, previous, trendWord, delta, percent, topReason }) =>
      `ಈ ತಿಂಗಳು ನೀವು Rs ${current.toFixed(2)} ಖರ್ಚು ಮಾಡಿದ್ದೀರಿ, ಹಿಂದಿನ ತಿಂಗಳು Rs ${previous.toFixed(2)} ಆಗಿತ್ತು. ಇದು Rs ${Math.abs(delta).toFixed(2)} (${Math.abs(percent).toFixed(2)}%) ${trendWord}. ${topReason}`,
    topReasonIncrease: ({ category, change }) =>
      `ಅತ್ಯಂತ ದೊಡ್ಡ ಏರಿಕೆ ${category} ನಲ್ಲಿ ಕಂಡುಬಂತು, ಅದು ಹಿಂದಿನ ತಿಂಗಳಿಗಿಂತ Rs ${Math.abs(change).toFixed(2)} ಬದಲಾಗಿದೆ.`,
    topReasonDecrease: ({ category, change }) =>
      `ಅತ್ಯಂತ ದೊಡ್ಡ ಇಳಿಕೆ ${category} ನಲ್ಲಿ ಕಂಡುಬಂತು, ಅದು ಹಿಂದಿನ ತಿಂಗಳಿಗಿಂತ Rs ${Math.abs(change).toFixed(2)} ಬದಲಾಗಿದೆ.`,
    unusualIntro: "ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಖರ್ಚು ಮಾದರಿಯ ಆಧಾರದ ಮೇಲೆ ಇವು ಅಸಾಮಾನ್ಯವಾಗಿವೆ:",
    unusualNone: "ಈಗ ತುಂಬಾ ಅಸಾಮಾನ್ಯ ಖರ್ಚುಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    unusualItem: ({ description, amount, category, score }) =>
      `${category} ನಲ್ಲಿ ${description} ಗೆ Rs ${amount.toFixed(2)} ಖರ್ಚು ಅಸಾಮಾನ್ಯವಾಗಿದೆ (${score}x ಸಾಮಾನ್ಯ ಮಟ್ಟ).`,
  },
};

const INTENTS = [
  { type: "dashboard", keywords: ["dashboard", "overview", "home screen", "डैशबोर्ड", "డాష్‌బోర్డ్", "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್"] },
  { type: "reports", keywords: ["report", "reports", "trend report", "open reports", "रिपोर्ट", "रिपोर्ट्स", "రిపోర్ట్", "రిపోర్ట్స్", "ವರದಿ", "ವರದಿಗಳು"] },
  { type: "uploadPdf", keywords: ["pdf", "statement", "bank statement", "स्टेटमेंट", "స్టేట్‌మెంట్", "ಸ್ಟೇಟ್ಮೆಂಟ್"] },
  { type: "uploadBill", keywords: ["bill", "receipt", "ocr", "बिल", "रसीद", "బిల్", "రసీదు", "ಬಿಲ್", "ರಸೀದಿ"] },
  { type: "goals", keywords: ["goal", "saving goal", "planner", "save for", "goal planner", "लक्ष्य", "बचत योजना", "లక్ష్యం", "సేవింగ్ ప్లానర్", "ಗುರಿ", "ಉಳಿತಾಯ ಯೋಜನೆ"] },
  { type: "settings", keywords: ["language", "settings", "preference", "भाषा", "सेटिंग", "భాష", "సెట్టింగ్స్", "ಭಾಷೆ", "ಸೆಟ್ಟಿಂಗ್ಸ್"] },
  { type: "monthlyExpenses", keywords: ["monthly expense", "this month spend", "show my monthly expenses", "मासिक खर्च", "इस महीने", "ఈ నెల ఖర్చు", "ఈ నెల", "ಈ ತಿಂಗಳ ಖರ್ಚು", "ಈ ತಿಂಗಳು"] },
  { type: "categorySummary", keywords: ["category", "categories", "top category", "कैटेगरी", "కేటగిరీ", "ವರ್ಗ"] },
  { type: "recentExpenses", keywords: ["recent expense", "latest expense", "last expense", "हाल के खर्च", "తాజా ఖర్చులు", "ಇತ್ತೀಚಿನ ಖರ್ಚು"] },
  { type: "budgetFaq", keywords: ["budget", "spending limit", "बजट", "బడ్జెట్", "ಬಜೆಟ್"] },
  { type: "reportsFaq", keywords: ["how reports work", "report feature", "what reports", "रिपोर्ट कैसे", "రిపోర్ట్స్ ఎలా", "ವರದಿ ಹೇಗೆ"] },
  { type: "spendingExplanation", keywords: ["why did i spend more", "compare with last month", "spending change", "expense comparison", "month comparison", "how did spending change", "मैंने ज्यादा क्यों खर्च किया", "నేను ఎక్కువ ఎందుకు ఖర్చు చేశాను", "ನಾನು ಹೆಚ್ಚು ಯಾಕೆ ಖರ್ಚು ಮಾಡಿದೆ"] },
  { type: "unusualTransactions", keywords: ["unusual transaction", "unusual expense", "strange expense", "outlier", "suspicious spending", "abnormal expense", "असामान्य खर्च", "వింత ఖర్చు", "ಅಸಾಮಾನ್ಯ ಖರ್ಚು"] },
  { type: "savingSuggestions", keywords: ["saving suggestions", "how can i save", "where can i save", "save money", "saving tips", "बचत सुझाव", "డబ్బు ఎలా సేవ్ చేయాలి", "ಉಳಿತಾಯ ಸಲಹೆ", "ಎಲ್ಲಿ ಸೇವ್ ಮಾಡಬಹುದು"] },
];

const normalizeLanguage = (language) => (SUPPORTED_LANGUAGES.has(language) ? language : "en");

const getStrings = (language) => ({
  ...STRINGS.en,
  ...(STRINGS[normalizeLanguage(language)] || {}),
});

const formatCurrency = (value) => Number(value || 0).toFixed(2);

const detectIntent = (message) => {
  const normalized = (message || "").toLowerCase().trim();

  for (const intent of INTENTS) {
    if (intent.keywords.some((keyword) => normalized.includes(keyword))) {
      return intent.type;
    }
  }

  return "fallback";
};

const getIstDateParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
};

const getMonthDateRange = (year, month) => {
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextMonthYear = month === 12 ? year + 1 : year;

  return {
    startDate: new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00+05:30`),
    endDate: new Date(`${nextMonthYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00+05:30`),
  };
};

const getCurrentAndPreviousMonthRanges = () => {
  const today = getIstDateParts();
  const current = getMonthDateRange(today.year, today.month);
  const previousMonth = today.month === 1 ? 12 : today.month - 1;
  const previousYear = today.month === 1 ? today.year - 1 : today.year;
  const previous = getMonthDateRange(previousYear, previousMonth);

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

const getMonthlyCategoryTotals = async (userId, range) => {
  return Transaction.aggregate([
    { $match: { userId, type: "DEBIT", date: { $gte: range.startDate, $lt: range.endDate } } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
  ]);
};

const getSpendingComparisonInsight = async (userId, language) => {
  const strings = getStrings(language);
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
    getMonthlyCategoryTotals(userId, current),
    getMonthlyCategoryTotals(userId, previous),
  ]);

  const currentTotal = currentTotals[0]?.total || 0;
  const previousTotal = previousTotals[0]?.total || 0;

  if (currentTotal === 0 && previousTotal === 0) {
    return {
      reply: strings.noData,
      route: UI_ROUTES.reports,
    };
  }

  const delta = currentTotal - previousTotal;
  const percent = previousTotal === 0 ? 100 : (delta / previousTotal) * 100;
  const trendWordByLanguage = {
    en: delta >= 0 ? "up" : "down",
    hi: delta >= 0 ? "बढ़ा" : "घटा",
    te: delta >= 0 ? "పెరిగింది" : "తగ్గింది",
    kn: delta >= 0 ? "ಹೆಚ್ಚಾಗಿದೆ" : "ಕಡಿಮೆಯಾಗಿದೆ",
  };

  const currentMap = new Map(currentCategories.map((item) => [item._id || "Uncategorized", item.total]));
  const previousMap = new Map(previousCategories.map((item) => [item._id || "Uncategorized", item.total]));
  const categoryNames = new Set([...currentMap.keys(), ...previousMap.keys()]);

  let strongestCategory = "Uncategorized";
  let strongestChange = 0;

  for (const category of categoryNames) {
    const change = (currentMap.get(category) || 0) - (previousMap.get(category) || 0);
    if (Math.abs(change) > Math.abs(strongestChange)) {
      strongestChange = change;
      strongestCategory = category;
    }
  }

  const reason = strongestChange >= 0
    ? strings.topReasonIncrease({ category: strongestCategory, change: strongestChange })
    : strings.topReasonDecrease({ category: strongestCategory, change: strongestChange });

  return {
    reply: strings.spendingExplain({
      current: currentTotal,
      previous: previousTotal,
      trendWord: trendWordByLanguage[normalizeLanguage(language)],
      delta,
      percent,
      topReason: reason,
    }),
    route: UI_ROUTES.reports,
    data: {
      currentExpense: Number(currentTotal.toFixed(2)),
      previousExpense: Number(previousTotal.toFixed(2)),
      change: Number(delta.toFixed(2)),
      strongestCategory,
      strongestChange: Number(strongestChange.toFixed(2)),
    },
  };
};

const getUnusualTransactionsInsight = async (userId, language) => {
  const strings = getStrings(language);

  const recentTransactions = await Transaction.find({ userId, type: "DEBIT" })
    .sort({ date: -1 })
    .limit(60)
    .lean();

  if (recentTransactions.length < 6) {
    return {
      reply: strings.noData,
      route: UI_ROUTES.dashboard,
    };
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
      const safeBaseline = baseline > 0 ? baseline : item.amount || 1;
      const ratio = item.amount / safeBaseline;

      return {
        ...item,
        score: ratio,
      };
    })
    .filter((item) => item.score >= 2.2 && item.amount >= 100)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (!unusual.length) {
    return {
      reply: strings.unusualNone,
      route: UI_ROUTES.dashboard,
    };
  }

  const lines = unusual.map((item) =>
    strings.unusualItem({
      description: item.description,
      amount: item.amount,
      category: item.category || "Uncategorized",
      score: item.score.toFixed(1),
    })
  );

  return {
    reply: `${strings.unusualIntro} ${lines.join(" ")}`,
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
  const strings = getStrings(language);
  const comparison = await getSpendingComparisonInsight(userId, language);
  const unusual = await getUnusualTransactionsInsight(userId, language);
  const summary = await getMonthlyExpenseSummary(userId);

  if (!summary.total) {
    return {
      reply: strings.savingsNone,
      route: UI_ROUTES.reports,
    };
  }

  const suggestions = [];

  if (comparison.data?.strongestCategory && comparison.data?.strongestChange > 0) {
    suggestions.push(
      strings.savingsCategorySpike({
        category: comparison.data.strongestCategory,
        amount: comparison.data.strongestChange,
      })
    );
  }

  const topCategory = summary.topCategories[0];
  if (topCategory && summary.total > 0) {
    suggestions.push(
      strings.savingsTopCategory({
        category: topCategory._id || "Uncategorized",
        share: (topCategory.total / summary.total) * 100,
      })
    );
  }

  if (unusual.data?.items?.length) {
    const item = unusual.data.items[0];
    suggestions.push(
      strings.savingsUnusual({
        description: item.description,
        amount: item.amount,
      })
    );
  }

  const uniqueSuggestions = [...new Set(suggestions)].slice(0, 3);

  if (!uniqueSuggestions.length) {
    return {
      reply: strings.savingsNone,
      route: UI_ROUTES.reports,
    };
  }

  return {
    reply: `${strings.savingsIntro} ${uniqueSuggestions.join(" ")}`,
    route: UI_ROUTES.reports,
    data: {
      suggestions: uniqueSuggestions,
    },
  };
};

export const buildChatbotReply = async ({ userId, message, preferredLanguage }) => {
  const language = normalizeLanguage(preferredLanguage);
  const strings = getStrings(language);
  const intent = detectIntent(message);

  if (!message?.trim()) {
    return {
      reply: strings.greeting,
      route: UI_ROUTES.dashboard,
      quickReplies: ["Dashboard", "Reports", "Goals", "Monthly expenses", "Why did I spend more?", "Saving suggestions"],
    };
  }

  switch (intent) {
    case "dashboard":
      return { reply: strings.dashboard, route: UI_ROUTES.dashboard };
    case "reports":
      return { reply: strings.reports, route: UI_ROUTES.reports };
    case "uploadPdf":
      return { reply: strings.uploadPdf, route: UI_ROUTES.uploadPdf };
    case "uploadBill":
      return { reply: strings.uploadBill, route: UI_ROUTES.uploadBill };
    case "goals":
      return { reply: strings.goals, route: UI_ROUTES.goals };
    case "settings":
      return { reply: strings.settings, route: UI_ROUTES.settings };
    case "monthlyExpenses": {
      const summary = await getMonthlyExpenseSummary(userId);
      return {
        reply: strings.monthSummary(summary),
        route: UI_ROUTES.reports,
        data: {
          totalExpense: Number(formatCurrency(summary.total)),
          topCategory: summary.topCategory,
        },
      };
    }
    case "categorySummary": {
      const summary = await getMonthlyExpenseSummary(userId);
      const items = summary.topCategories.length
        ? summary.topCategories.map((item) => `${item._id || "Uncategorized"} (Rs ${formatCurrency(item.total)})`).join(", ")
        : strings.noData;

      return {
        reply: strings.categorySummary(items),
        route: UI_ROUTES.reports,
      };
    }
    case "recentExpenses": {
      const summary = await getMonthlyExpenseSummary(userId);
      const items = summary.recent.length
        ? summary.recent.map((item) => `${item.description} - Rs ${formatCurrency(item.amount)}`).join(", ")
        : strings.noData;

      return {
        reply: strings.recentExpenses(items),
        route: UI_ROUTES.dashboard,
      };
    }
    case "spendingExplanation":
      return getSpendingComparisonInsight(userId, language);
    case "unusualTransactions":
      return getUnusualTransactionsInsight(userId, language);
    case "savingSuggestions":
      return getSavingSuggestionsInsight(userId, language);
    case "budgetFaq":
      return { reply: strings.budgetFaq, route: UI_ROUTES.reports };
    case "reportsFaq":
      return { reply: strings.reportsFaq, route: UI_ROUTES.reports };
    default:
      return {
        reply: strings.fallback,
        quickReplies: ["Dashboard", "Reports", "Goals", "Monthly expenses", "Why did I spend more?", "Saving suggestions"],
      };
  }
};
