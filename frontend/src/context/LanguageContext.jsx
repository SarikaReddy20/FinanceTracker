import { createContext, useContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";

const LanguageContext = createContext(null);

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు" },
  { code: "hi", label: "हिन्दी" },
  { code: "kn", label: "ಕನ್ನಡ" },
];

const translations = {
  en: {
    appName: "SpendSmart",
    navDashboard: "Dashboard",
    navReports: "Reports",
    navPdf: "PDF Upload",
    navBill: "Bill OCR",
    navSettings: "Settings",
    logout: "Logout",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    settingsTitle: "Settings",
    settingsSubtitle: "Change your language any time without affecting your saved financial data.",
    languageLabel: "Preferred language",
    saveLanguage: "Save language",
    saving: "Saving...",
    languageSaved: "Language updated successfully.",
    chatTitle: "SpendSmart Assistant",
    chatPlaceholder: "Ask about reports, expenses, uploads, or settings...",
    send: "Send",
    askSuggestions: "Try asking",
    openPage: "Open page",
    loginHeadline: "Turn receipts, statements, and spending into a clear money story.",
    loginCopy: "Upload PDFs and bills, track trends over time, compare periods, and get a dashboard that actually helps you make better decisions.",
    welcomeBack: "Welcome back",
    loginCta: "Login",
    createAccount: "Create account",
    email: "Email",
    password: "Password",
    registerHeadline: "Build your own personal finance cockpit.",
    registerCopy: "Start with automated uploads, then explore category breakdowns, daily and monthly trends, and downloadable reports inside a dashboard built around clarity.",
    registerCta: "Register",
    name: "Name",
    backToLogin: "Back to login",
    dashboardHero: "See how your money is moving, where it goes, and what changed.",
    dashboardCopy: "Track spending trends, compare periods, and surface your most important money insights in one place.",
    totalExpense: "Total Expense",
    totalIncome: "Total Income",
    balance: "Balance",
    transactions: "Transactions",
    topCategory: "Top category",
    averageDailySpend: "Average daily spend",
    trendVsPrevious: "Trend vs previous period",
    recentTransactions: "Recent Transactions",
    latestItems: "Latest items from the selected range.",
    noTransactions: "No transactions found for this range.",
    reportsHero: "Explore trends by day, week, month, year, or your own custom range.",
    reportsCopy: "Compare current spending with previous periods, inspect category contribution, and export your report for offline reference.",
    exportPdf: "Export PDF",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
    selectedRangeExpense: "Selected Range Expense",
    selectedRangeIncome: "Selected Range Income",
    categoryBreakdown: "Category Breakdown",
    contribution: "Contribution",
    uploadPdfHero: "Drop in a bank statement and let SpendSmart organize the hard part.",
    uploadPdfCopy: "Upload a PDF bank statement to extract transactions, skip duplicates, and push fresh spending data into your dashboard and reports.",
    uploadStatement: "Upload Statement",
    imported: "Imported",
    duplicatesSkipped: "Duplicates Skipped",
    needReview: "Need Review",
    categoryReview: "Category Review",
    categoryReviewCopy: "Any imported items that still need a category can be fixed here.",
    uploadBillHero: "Scan receipts and turn messy bill images into useful transaction data.",
    uploadBillCopy: "Upload a receipt image to extract description, amount, date, time, and field confidence before it lands in your reports.",
    uploadBill: "Upload Bill",
    processedSuccessfully: "Processed Successfully",
    needsReview: "Needs Review",
    description: "Description",
    amount: "Amount",
    category: "Category",
    date: "Date",
    time: "Time",
    source: "Source",
    confidence: "Confidence",
    missingFields: "Missing fields",
    lowConfidenceFields: "Low confidence fields",
    descriptionCandidates: "Description Candidates",
    amountCandidates: "Amount Candidates",
    ocrText: "OCR Text",
    choosePdf: "Choose a PDF statement",
    chooseBill: "Choose a bill image",
  },
  hi: {
    appName: "SpendSmart",
    navDashboard: "डैशबोर्ड",
    navReports: "रिपोर्ट्स",
    navPdf: "PDF अपलोड",
    navBill: "बिल OCR",
    navSettings: "सेटिंग्स",
    logout: "लॉगआउट",
    darkMode: "डार्क मोड",
    lightMode: "लाइट मोड",
    settingsTitle: "सेटिंग्स",
    settingsSubtitle: "अपनी भाषा कभी भी बदलें, इससे आपका सेव किया हुआ डेटा प्रभावित नहीं होगा।",
    languageLabel: "पसंदीदा भाषा",
    saveLanguage: "भाषा सेव करें",
    saving: "सेव हो रहा है...",
    languageSaved: "भाषा सफलतापूर्वक अपडेट हुई।",
    chatTitle: "SpendSmart सहायक",
    chatPlaceholder: "रिपोर्ट, खर्च, अपलोड या सेटिंग्स के बारे में पूछें...",
    send: "भेजें",
    askSuggestions: "यह पूछ कर देखें",
    loginHeadline: "रसीदों, स्टेटमेंट्स और खर्च को एक साफ़ कहानी में बदलें।",
    loginCopy: "PDF और बिल अपलोड करें, ट्रेंड्स देखें, पीरियड्स तुलना करें और उपयोगी डैशबोर्ड पाएं।",
    welcomeBack: "फिर से स्वागत है",
    loginCta: "लॉगिन",
    createAccount: "अकाउंट बनाएं",
    email: "ईमेल",
    password: "पासवर्ड",
    registerHeadline: "अपना व्यक्तिगत फाइनेंस कंट्रोल सेंटर बनाएं।",
    registerCopy: "ऑटोमेटेड अपलोड से शुरू करें, फिर कैटेगरी ब्रेकडाउन, ट्रेंड्स और डाउनलोडेबल रिपोर्ट्स देखें।",
    registerCta: "रजिस्टर",
    name: "नाम",
    backToLogin: "लॉगिन पर वापस जाएँ",
    dashboardHero: "देखें आपका पैसा कहाँ जा रहा है और क्या बदला है।",
    dashboardCopy: "खर्च के ट्रेंड्स देखें, पीरियड्स तुलना करें और महत्वपूर्ण इनसाइट्स एक जगह पाएं।",
    totalExpense: "कुल खर्च",
    totalIncome: "कुल आय",
    balance: "बैलेंस",
    transactions: "ट्रांजैक्शन्स",
    topCategory: "शीर्ष कैटेगरी",
    averageDailySpend: "औसत दैनिक खर्च",
    trendVsPrevious: "पिछले पीरियड से तुलना",
    recentTransactions: "हाल की ट्रांजैक्शन्स",
    latestItems: "चुनी गई तारीख सीमा की नवीनतम एंट्रियाँ।",
    noTransactions: "इस सीमा में कोई ट्रांजैक्शन नहीं मिला।",
    reportsHero: "दिन, सप्ताह, महीना, साल या अपनी पसंद की तारीख सीमा से ट्रेंड्स देखें।",
    reportsCopy: "वर्तमान खर्च की पिछले पीरियड से तुलना करें, कैटेगरी योगदान देखें और PDF एक्सपोर्ट करें।",
    exportPdf: "PDF एक्सपोर्ट",
    daily: "दैनिक",
    weekly: "साप्ताहिक",
    monthly: "मासिक",
    yearly: "वार्षिक",
    selectedRangeExpense: "चुनी गई सीमा का खर्च",
    selectedRangeIncome: "चुनी गई सीमा की आय",
    categoryBreakdown: "कैटेगरी ब्रेकडाउन",
    contribution: "योगदान",
    uploadPdfHero: "बैंक स्टेटमेंट डालें और SpendSmart बाकी काम संभाल लेगा।",
    uploadPdfCopy: "PDF स्टेटमेंट अपलोड करें ताकि ट्रांजैक्शन्स निकले, डुप्लिकेट हटें और रिपोर्ट्स अपडेट हों।",
    uploadStatement: "स्टेटमेंट अपलोड करें",
    imported: "इम्पोर्ट किया गया",
    duplicatesSkipped: "डुप्लिकेट छोड़े गए",
    needReview: "रीव्यू चाहिए",
    categoryReview: "कैटेगरी रीव्यू",
    categoryReviewCopy: "जिन इम्पोर्टेड आइटम्स को अभी भी कैटेगरी चाहिए, उन्हें यहाँ ठीक करें।",
    uploadBillHero: "रसीद स्कैन करें और बिल इमेज को उपयोगी ट्रांजैक्शन डेटा में बदलें।",
    uploadBillCopy: "रसीद इमेज अपलोड करें ताकि विवरण, राशि, तारीख, समय और कॉन्फिडेंस निकले।",
    uploadBill: "बिल अपलोड करें",
    processedSuccessfully: "सफलतापूर्वक प्रोसेस हुआ",
    needsReview: "रीव्यू चाहिए",
    description: "विवरण",
    amount: "राशि",
    category: "कैटेगरी",
    date: "तारीख",
    time: "समय",
    source: "स्रोत",
    confidence: "विश्वास स्तर",
    missingFields: "गुम फ़ील्ड्स",
    lowConfidenceFields: "कम कॉन्फिडेंस फ़ील्ड्स",
    descriptionCandidates: "विवरण विकल्प",
    amountCandidates: "राशि विकल्प",
    ocrText: "OCR टेक्स्ट",
    choosePdf: "PDF स्टेटमेंट चुनें",
    chooseBill: "बिल इमेज चुनें",
  },
  te: {
    appName: "SpendSmart",
    navDashboard: "డాష్‌బోర్డ్",
    navReports: "రిపోర్ట్స్",
    navPdf: "PDF అప్లోడ్",
    navBill: "బిల్ OCR",
    navSettings: "సెట్టింగ్స్",
    logout: "లాగౌట్",
    darkMode: "డార్క్ మోడ్",
    lightMode: "లైట్ మోడ్",
    settingsTitle: "సెట్టింగ్స్",
    settingsSubtitle: "సేవ్ చేసిన డేటా మారకుండా మీరు ఎప్పుడైనా భాష మార్చవచ్చు.",
    languageLabel: "ఇష్టమైన భాష",
    saveLanguage: "భాషను సేవ్ చేయండి",
    saving: "సేవ్ అవుతోంది...",
    languageSaved: "భాష విజయవంతంగా అప్డేట్ అయింది.",
    chatTitle: "SpendSmart అసిస్టెంట్",
    chatPlaceholder: "రిపోర్ట్స్, ఖర్చులు, అప్లోడ్స్ లేదా సెట్టింగ్స్ గురించి అడగండి...",
    send: "పంపండి",
    askSuggestions: "ఇవి అడగండి",
    loginHeadline: "రసీదులు, స్టేట్‌మెంట్లు, ఖర్చులను స్పష్టమైన మనీ స్టోరీగా మార్చండి.",
    loginCopy: "PDFలు, బిల్లులు అప్లోడ్ చేయండి, ట్రెండ్స్ చూడండి, పీరియడ్స్ పోల్చండి, ఉపయోగకరమైన డాష్‌బోర్డ్ పొందండి.",
    welcomeBack: "మళ్లీ స్వాగతం",
    loginCta: "లాగిన్",
    createAccount: "ఖాతా సృష్టించండి",
    email: "ఇమెయిల్",
    password: "పాస్‌వర్డ్",
    registerHeadline: "మీ స్వంత ఫైనాన్స్ కాక్‌పిట్ నిర్మించండి.",
    registerCopy: "ఆటోమేటెడ్ అప్లోడ్స్‌తో మొదలు పెట్టి, కేటగిరీ బ్రేక్‌డౌన్‌లు, ట్రెండ్స్, డౌన్‌లోడ్ చేయగల రిపోర్ట్స్ చూడండి.",
    registerCta: "రిజిస్టర్",
    name: "పేరు",
    backToLogin: "లాగిన్‌కు తిరిగి వెళ్ళండి",
    dashboardHero: "మీ డబ్బు ఎలా కదులుతోంది, ఎక్కడ ఖర్చవుతోంది, ఏమి మారిందో చూడండి.",
    dashboardCopy: "ఖర్చు ట్రెండ్స్, పీరియడ్ పోలికలు, ముఖ్యమైన ఫైనాన్స్ ఇన్‌సైట్స్ అన్నీ ఒకేచోట చూడండి.",
    totalExpense: "మొత్తం ఖర్చు",
    totalIncome: "మొత్తం ఆదాయం",
    balance: "బ్యాలెన్స్",
    transactions: "ట్రాన్సాక్షన్లు",
    topCategory: "అత్యధిక కేటగిరీ",
    averageDailySpend: "సగటు రోజువారీ ఖర్చు",
    trendVsPrevious: "గత పీరియడ్‌తో పోలిక",
    recentTransactions: "తాజా ట్రాన్సాక్షన్లు",
    latestItems: "ఎంచుకున్న తేదీ పరిధిలో తాజా అంశాలు.",
    noTransactions: "ఈ పరిధిలో ట్రాన్సాక్షన్లు లేవు.",
    reportsHero: "రోజు, వారం, నెల, సంవత్సరం లేదా మీకు నచ్చిన తేదీ పరిధిలో ట్రెండ్స్ చూడండి.",
    reportsCopy: "ప్రస్తుత ఖర్చును గత పీరియడ్‌తో పోల్చండి, కేటగిరీ వాటాను చూడండి, PDF ఎగుమతి చేయండి.",
    exportPdf: "PDF ఎగుమతి",
    daily: "రోజువారీ",
    weekly: "వారానికొకసారి",
    monthly: "నెలవారీ",
    yearly: "సంవత్సరవారీ",
    selectedRangeExpense: "ఎంచుకున్న పరిధి ఖర్చు",
    selectedRangeIncome: "ఎంచుకున్న పరిధి ఆదాయం",
    categoryBreakdown: "కేటగిరీ విభజన",
    contribution: "వాటా",
    uploadPdfHero: "బ్యాంక్ స్టేట్‌మెంట్ వేయండి, మిగతా పని SpendSmart చూసుకుంటుంది.",
    uploadPdfCopy: "PDF స్టేట్‌మెంట్ అప్లోడ్ చేసి ట్రాన్సాక్షన్లు తీయండి, డుప్లికేట్లు తీసేయండి, రిపోర్ట్స్ అప్డేట్ చేయండి.",
    uploadStatement: "స్టేట్‌మెంట్ అప్లోడ్",
    imported: "ఇంపోర్ట్ అయ్యాయి",
    duplicatesSkipped: "డుప్లికేట్లు దాటివేయబడ్డాయి",
    needReview: "రివ్యూ అవసరం",
    categoryReview: "కేటగిరీ రివ్యూ",
    categoryReviewCopy: "ఇంకా కేటగిరీ అవసరమైన ఇంపోర్ట్ చేసిన అంశాలను ఇక్కడ సరిచేయండి.",
    uploadBillHero: "రసీదులను స్కాన్ చేసి బిల్ చిత్రాలను ఉపయోగకరమైన డేటాగా మార్చండి.",
    uploadBillCopy: "రసీదు ఇమేజ్ అప్లోడ్ చేసి వివరణ, మొత్తం, తేదీ, సమయం, నమ్మకం స్థాయి పొందండి.",
    uploadBill: "బిల్ అప్లోడ్",
    processedSuccessfully: "విజయవంతంగా పూర్తైంది",
    needsReview: "రివ్యూ అవసరం",
    description: "వివరణ",
    amount: "మొత్తం",
    category: "కేటగిరీ",
    date: "తేదీ",
    time: "సమయం",
    source: "మూలం",
    confidence: "నమ్మకం స్థాయి",
    missingFields: "లేని ఫీల్డ్స్",
    lowConfidenceFields: "తక్కువ నమ్మకం ఫీల్డ్స్",
    descriptionCandidates: "వివరణ ఎంపికలు",
    amountCandidates: "మొత్తం ఎంపికలు",
    ocrText: "OCR టెక్స్ట్",
    choosePdf: "PDF స్టేట్‌మెంట్ ఎంచుకోండి",
    chooseBill: "బిల్ ఇమేజ్ ఎంచుకోండి",
  },
  kn: {
    appName: "SpendSmart",
    navDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    navReports: "ವರದಿಗಳು",
    navPdf: "PDF ಅಪ್ಲೋಡ್",
    navBill: "ಬಿಲ್ OCR",
    navSettings: "ಸೆಟ್ಟಿಂಗ್ಸ್",
    logout: "ಲಾಗ್‌ಔಟ್",
    darkMode: "ಡಾರ್ಕ್ ಮೋಡ್",
    lightMode: "ಲೈಟ್ ಮೋಡ್",
    settingsTitle: "ಸೆಟ್ಟಿಂಗ್ಸ್",
    settingsSubtitle: "ನಿಮ್ಮ ಉಳಿಸಿದ ಡೇಟಾಗೆ ಪರಿಣಾಮ ಬಾರದೆ ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ಭಾಷೆ ಬದಲಾಯಿಸಬಹುದು.",
    languageLabel: "ಆದ್ಯ ಭಾಷೆ",
    saveLanguage: "ಭಾಷೆ ಉಳಿಸಿ",
    saving: "ಉಳಿಸುತ್ತಿದೆ...",
    languageSaved: "ಭಾಷೆ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
    chatTitle: "SpendSmart ಸಹಾಯಕ",
    chatPlaceholder: "ವರದಿಗಳು, ಖರ್ಚುಗಳು, ಅಪ್ಲೋಡ್‌ಗಳು ಅಥವಾ ಸೆಟ್ಟಿಂಗ್ಸ್ ಬಗ್ಗೆ ಕೇಳಿ...",
    send: "ಕಳುಹಿಸಿ",
    askSuggestions: "ಇವು ಕೇಳಿ",
    loginHeadline: "ರಸೀದಿಗಳು, ಸ್ಟೇಟ್ಮೆಂಟ್‌ಗಳು ಮತ್ತು ಖರ್ಚುಗಳನ್ನು ಸ್ಪಷ್ಟವಾದ ಹಣಕಾಸು ಕಥೆಯಾಗಿ ಮಾಡಿ.",
    loginCopy: "PDF ಮತ್ತು ಬಿಲ್‌ಗಳನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ, ಟ್ರೆಂಡ್ಸ್ ನೋಡಿ, ಅವಧಿಗಳನ್ನು ಹೋಲಿಸಿ ಮತ್ತು ಉಪಯುಕ್ತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪಡೆಯಿರಿ.",
    welcomeBack: "ಮತ್ತೆ ಸ್ವಾಗತ",
    loginCta: "ಲಾಗಿನ್",
    createAccount: "ಖಾತೆ ರಚಿಸಿ",
    email: "ಇಮೇಲ್",
    password: "ಪಾಸ್‌ವರ್ಡ್",
    registerHeadline: "ನಿಮ್ಮದೇ ವೈಯಕ್ತಿಕ ಹಣಕಾಸು ಕಾಕ್‌ಪಿಟ್ ನಿರ್ಮಿಸಿ.",
    registerCopy: "ಸ್ವಯಂಚಾಲಿತ ಅಪ್ಲೋಡ್‌ಗಳಿಂದ ಪ್ರಾರಂಭಿಸಿ, ನಂತರ ವರ್ಗ ವಿಭಜನೆಗಳು, ಟ್ರೆಂಡ್ಸ್ ಮತ್ತು ಡೌನ್‌ಲೋಡ್ ವರದಿಗಳನ್ನು ನೋಡಿ.",
    registerCta: "ನೋಂದಣಿ",
    name: "ಹೆಸರು",
    backToLogin: "ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    dashboardHero: "ನಿಮ್ಮ ಹಣ ಹೇಗೆ ಚಲಿಸುತ್ತಿದೆ, ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದೆ, ಏನು ಬದಲಾಗಿದೆ ನೋಡಿ.",
    dashboardCopy: "ಖರ್ಚಿನ ಟ್ರೆಂಡ್ಸ್, ಅವಧಿ ಹೋಲಿಕೆಗಳು ಮತ್ತು ಮುಖ್ಯ ಹಣಕಾಸು ಇನ್ಸೈಟ್ಸ್ ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ನೋಡಿ.",
    totalExpense: "ಒಟ್ಟು ಖರ್ಚು",
    totalIncome: "ಒಟ್ಟು ಆದಾಯ",
    balance: "ಬ್ಯಾಲೆನ್ಸ್",
    transactions: "ವಹಿವಾಟುಗಳು",
    topCategory: "ಮುಖ್ಯ ವರ್ಗ",
    averageDailySpend: "ಸರಾಸರಿ ದೈನಂದಿನ ಖರ್ಚು",
    trendVsPrevious: "ಹಿಂದಿನ ಅವಧಿಯೊಂದಿಗೆ ಹೋಲಿಕೆ",
    recentTransactions: "ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು",
    latestItems: "ಆಯ್ಕೆ ಮಾಡಿದ ಅವಧಿಯ ಇತ್ತೀಚಿನ ಅಂಶಗಳು.",
    noTransactions: "ಈ ಅವಧಿಗೆ ಯಾವುದೇ ವಹಿವಾಟುಗಳಿಲ್ಲ.",
    reportsHero: "ದಿನ, ವಾರ, ತಿಂಗಳು, ವರ್ಷ ಅಥವಾ ನಿಮ್ಮದೇ ದಿನಾಂಕ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಟ್ರೆಂಡ್ಸ್ ನೋಡಿ.",
    reportsCopy: "ಪ್ರಸ್ತುತ ಖರ್ಚನ್ನು ಹಿಂದಿನ ಅವಧಿಯೊಂದಿಗೆ ಹೋಲಿಸಿ, ವರ್ಗ ಕೊಡುಗೆ ನೋಡಿ ಮತ್ತು PDF ಎಕ್ಸ್‌ಪೋರ್ಟ್ ಮಾಡಿ.",
    exportPdf: "PDF ಎಕ್ಸ್‌ಪೋರ್ಟ್",
    daily: "ದೈನಂದಿನ",
    weekly: "ವಾರದ",
    monthly: "ಮಾಸಿಕ",
    yearly: "ವಾರ್ಷಿಕ",
    selectedRangeExpense: "ಆಯ್ಕೆ ಮಾಡಿದ ಅವಧಿಯ ಖರ್ಚು",
    selectedRangeIncome: "ಆಯ್ಕೆ ಮಾಡಿದ ಅವಧಿಯ ಆದಾಯ",
    categoryBreakdown: "ವರ್ಗ ವಿಭಜನೆ",
    contribution: "ಕೊಡುಗೆ",
    uploadPdfHero: "ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್ಮೆಂಟ್ ಹಾಕಿ, ಉಳಿದ ಕೆಲಸ SpendSmart ನೋಡಿಕೊಳ್ಳುತ್ತದೆ.",
    uploadPdfCopy: "PDF ಸ್ಟೇಟ್ಮೆಂಟ್ ಅಪ್ಲೋಡ್ ಮಾಡಿ, ವಹಿವಾಟುಗಳನ್ನು ತೆಗೆಯಿರಿ, ಡುಪ್ಲಿಕೇಟುಗಳನ್ನು ತಪ್ಪಿಸಿ, ವರದಿಗಳನ್ನು ನವೀಕರಿಸಿ.",
    uploadStatement: "ಸ್ಟೇಟ್ಮೆಂಟ್ ಅಪ್ಲೋಡ್",
    imported: "ಆಮದುಗೊಂಡವು",
    duplicatesSkipped: "ಡುಪ್ಲಿಕೇಟುಗಳು ಬಿಟ್ಟವು",
    needReview: "ಪರಿಶೀಲನೆ ಬೇಕು",
    categoryReview: "ವರ್ಗ ಪರಿಶೀಲನೆ",
    categoryReviewCopy: "ಇನ್ನೂ ವರ್ಗ ಬೇಕಿರುವ ಆಮದುಗೊಂಡ ಅಂಶಗಳನ್ನು ಇಲ್ಲಿ ಸರಿಪಡಿಸಿ.",
    uploadBillHero: "ರಸೀದಿಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಮತ್ತು ಚಿತ್ರಗಳನ್ನು ಉಪಯುಕ್ತ ವಹಿವಾಟು ಡೇಟಾವಾಗಿ ಮಾಡಿ.",
    uploadBillCopy: "ರಸೀದಿ ಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ, ವಿವರಣೆ, ಮೊತ್ತ, ದಿನಾಂಕ, ಸಮಯ ಮತ್ತು ವಿಶ್ವಾಸಮಟ್ಟ ಪಡೆಯಿರಿ.",
    uploadBill: "ಬಿಲ್ ಅಪ್ಲೋಡ್",
    processedSuccessfully: "ಯಶಸ್ವಿಯಾಗಿ ಪ್ರೊಸೆಸ್ ಆಯಿತು",
    needsReview: "ಪರಿಶೀಲನೆ ಬೇಕು",
    description: "ವಿವರಣೆ",
    amount: "ಮೊತ್ತ",
    category: "ವರ್ಗ",
    date: "ದಿನಾಂಕ",
    time: "ಸಮಯ",
    source: "ಮೂಲ",
    confidence: "ವಿಶ್ವಾಸಮಟ್ಟ",
    missingFields: "ಕಾಣೆಯಾದ ಫೀಲ್ಡ್‌ಗಳು",
    lowConfidenceFields: "ಕಡಿಮೆ ವಿಶ್ವಾಸ ಫೀಲ್ಡ್‌ಗಳು",
    descriptionCandidates: "ವಿವರಣೆ ಆಯ್ಕೆಗಳು",
    amountCandidates: "ಮೊತ್ತ ಆಯ್ಕೆಗಳು",
    ocrText: "OCR ಪಠ್ಯ",
    choosePdf: "PDF ಸ್ಟೇಟ್ಮೆಂಟ್ ಆಯ್ಕೆಮಾಡಿ",
    chooseBill: "ಬಿಲ್ ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ",
  },
};

const getStoredLanguage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return user?.preferredLanguage || localStorage.getItem("preferredLanguage") || "en";
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getStoredLanguage);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("preferredLanguage", language);
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user) {
      localStorage.setItem("user", JSON.stringify({ ...user, preferredLanguage: language }));
    }
  }, [language]);

  useEffect(() => {
    const syncLanguage = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      try {
        const res = await API.get("/auth/me");
        const nextLanguage = res.data.preferredLanguage || "en";
        setLanguage(nextLanguage);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch {
        // fall back to local storage if profile fetch fails
      }
    };

    syncLanguage();
  }, []);

  const setLanguagePreference = async (nextLanguage, persist = false) => {
    setLanguage(nextLanguage);

    if (!persist || !localStorage.getItem("token")) {
      return;
    }

    setLoading(true);
    try {
      const res = await API.put("/auth/preferences/language", { preferredLanguage: nextLanguage });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setLanguage(res.data.user.preferredLanguage);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      language,
      loading,
      t: (key) => translations[language]?.[key] || translations.en[key] || key,
      setLanguagePreference,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, loading],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);

  if (!value) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return value;
}
