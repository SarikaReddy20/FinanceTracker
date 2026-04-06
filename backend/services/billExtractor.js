const DATE_PATTERNS = [
  /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/,
  /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/,
  /\b([A-Z][a-z]{2,8})\s+(\d{1,2}),?\s+(\d{4})\b/,
];

const TWELVE_HOUR_TIME_PATTERN = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
const TWENTY_FOUR_HOUR_TIME_PATTERN = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;
const TWENTY_FOUR_HOUR_COMPACT_PATTERN = /\b(?:time[:\s]*)?([01]?\d|2[0-3])([0-5]\d)\s*(?:hrs?)\b/i;

const DESCRIPTION_IGNORE_PATTERNS = [
  /^tax invoice$/i,
  /^invoice$/i,
  /^receipt$/i,
  /^cash bill$/i,
  /^bill no/i,
  /^invoice no/i,
  /^gst/i,
  /^phone/i,
  /^table/i,
  /^server/i,
  /^date/i,
  /^time/i,
  /^dt[:\s]/i,
  /^amount/i,
  /^total/i,
  /^grand total/i,
  /^party/i,
  /^customer/i,
  /^consumer/i,
  /^contracted/i,
  /^present/i,
  /^previous/i,
  /^units/i,
  /^arrears/i,
  /^development/i,
  /^majority/i,
  /^\d+$/,
];

const DESCRIPTION_BONUSES = [
  { pattern: /\brestaurant|biryani|cafe|bakery|hotel|pharmacy|medical|store|mart|supermarket\b/i, score: 0.2 },
  { pattern: /\btgspdcl|electricity|bill|recharge|airtel|jio|broadband|internet\b/i, score: 0.25 },
  { pattern: /\bgruha jyothi\b/i, score: 0.3 },
  { pattern: /\bbook\s*shop|book\s*shoppe|stationery|books\b/i, score: 0.28 },
];

const AMOUNT_PATTERNS = [
  { label: "net bill amount", regex: /net bill amount[^\d-]{0,20}(-?[\d,]+(?:\.\d{1,2})?)/i, score: 0.98 },
  { label: "bill amount", regex: /bill amount[^\d-]{0,20}(-?[\d,]+(?:\.\d{1,2})?)/i, score: 0.96 },
  { label: "grand total", regex: /grand total[^\d-]{0,20}(-?[\d,]+(?:\.\d{1,2})?)/i, score: 0.96 },
  { label: "total amount", regex: /total amount[^\d-]{0,20}(-?[\d,]+(?:\.\d{1,2})?)/i, score: 0.94 },
  { label: "amount paid", regex: /amount paid[^\d-]{0,20}(-?[\d,]+(?:\.\d{1,2})?)/i, score: 0.93 },
  { label: "total paid", regex: /total paid[^\d-]{0,20}(-?[\d,]+(?:\.\d{1,2})?)/i, score: 0.93 },
  { label: "cash tendered", regex: /cash tendered[^\d-]{0,20}(-?[\d,]+(?:\.\d{1,2})?)/i, score: 0.92 },
  { label: "net amount", regex: /net amount[^\d-]{0,20}(-?[\d,]+(?:\.\d{1,2})?)/i, score: 0.92 },
  { label: "cash", regex: /\bcash\b[^\d-]{0,20}(-?[\d,]+(?:\.\d{1,2})?)/i, score: 0.88 },
  { label: "total", regex: /\btotal\b[^\d-]{0,20}(-?[\d,]+(?:\.\d{1,2})?)/i, score: 0.88 },
  { label: "currency", regex: /(?:rs\.?|inr|₹)[^\d-]{0,5}(-?[\d,]+(?:\.\d{1,2})?)/i, score: 0.72 },
];

const normalizeWhitespace = (value) => value.replace(/\s+/g, " ").trim();
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const isInvoiceNoiseLine = (line) =>
  /\b(book|shop|shoppe|gstin|state name|mehdipatnam|invoice|customer)\b/i.test(line);

const cleanLines = (text) =>
  text
    .split("\n")
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean);

const isDateLikeText = (text) =>
  /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/.test(text) ||
  /\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/.test(text);

const scoreDescriptionCandidate = (line, index, lines) => {
  if (DESCRIPTION_IGNORE_PATTERNS.some((pattern) => pattern.test(line))) {
    return null;
  }

  if (isDateLikeText(line)) {
    return null;
  }

  const hasLongDigitRun = /\d{4,}/.test(line);
  const weirdCharPenalty = (line.match(/[^\w\s:'&()./\-]/g) || []).length * 0.08;
  const digitPenalty = hasLongDigitRun ? 0.35 : 0;
  const upperPenalty = line === line.toUpperCase() && line.length > 18 ? 0.12 : 0;
  const shortPenalty = line.length < 6 ? 0.25 : 0;
  const earlyBonus = index === 0 ? 0.2 : index <= 2 ? 0.12 : index <= 5 ? 0.05 : 0;
  const alphaRatio = ((line.match(/[A-Za-z]/g) || []).length / Math.max(line.length, 1));
  const alphaBonus = alphaRatio > 0.65 ? 0.2 : alphaRatio > 0.45 ? 0.1 : 0;
  const wordBonus = line.split(" ").length >= 2 ? 0.08 : 0;
  const titleBonus = /[A-Za-z]{3,}/.test(line) ? 0.08 : 0;

  let score = 0.35 + earlyBonus + alphaBonus + wordBonus + titleBonus - weirdCharPenalty - digitPenalty - upperPenalty - shortPenalty;

  for (const bonus of DESCRIPTION_BONUSES) {
    if (bonus.pattern.test(line)) {
      score += bonus.score;
    }
  }

  if (lines.join(" ").toLowerCase().includes("tgspdcl") && /gruha jyothi/i.test(line)) {
    score += 0.2;
  }

  return {
    value: line,
    confidence: clamp(score),
  };
};

const getDescriptionCandidates = (lines) => {
  const candidates = lines
    .slice(0, 10)
    .map((line, index) => scoreDescriptionCandidate(line, index, lines))
    .filter(Boolean)
    .sort((a, b) => b.confidence - a.confidence);

  if (candidates.length) {
    return candidates;
  }

  const joined = lines.join(" ").toLowerCase();
  if (joined.includes("tgspdcl") || joined.includes("electricity")) {
    const fallback = joined.includes("gruha jyothi")
      ? "TGSPDCL Gruha Jyothi Electricity Bill"
      : "Electricity Bill";
    return [{ value: fallback, confidence: 0.75 }];
  }

  return [];
};

const getAmountCandidates = (text) => {
  const lines = cleanLines(text);
  const candidates = [];

  for (const line of lines) {
    if (isDateLikeText(line) || /^time[:\s]/i.test(line) || /^dt[:\s]/i.test(line)) {
      continue;
    }

    for (const pattern of AMOUNT_PATTERNS) {
      const match = line.match(pattern.regex);
      if (!match) {
        continue;
      }

      const amount = Number.parseFloat(match[1].replace(/,/g, ""));
      if (!Number.isFinite(amount)) {
        continue;
      }

      let confidence = pattern.score;
      if (amount === 0 && /net bill amount/i.test(line) && /bill amount/i.test(text)) {
        confidence -= 0.08;
      }
      if (pattern.label === "currency" && isInvoiceNoiseLine(line)) {
        confidence -= 0.18;
      }
      if (/\d+\.\d{2}\b/.test(match[1])) {
        confidence += 0.04;
      }

      candidates.push({
        value: amount,
        label: pattern.label,
        line,
        confidence: clamp(confidence),
      });
    }
  }

  if (candidates.length) {
    return candidates.sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      return b.value - a.value;
    });
  }

const fallbackLines = lines.filter(
    (line) =>
      !isDateLikeText(line) &&
      !/^time[:\s]/i.test(line) &&
      !/^dt[:\s]/i.test(line) &&
      !isInvoiceNoiseLine(line) &&
      (/(?:rs\.?|inr|₹)/i.test(line) || /\d+\.\d{2}\b/.test(line)),
  );

  for (const line of fallbackLines) {
    const matches = [...line.matchAll(/(-?[\d,]+(?:\.\d{1,2})?)/g)];
    for (const match of matches) {
      const amount = Number.parseFloat(match[1].replace(/,/g, ""));
      if (!Number.isFinite(amount)) {
        continue;
      }

      candidates.push({
        value: amount,
        label: "fallback",
        line,
        confidence: clamp(/\d+\.\d{2}\b/.test(match[1]) ? 0.56 : 0.42),
      });
    }
  }

  return candidates.sort((a, b) => {
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence;
    }
    return b.value - a.value;
  });
};

const parseDate = (text) => {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (!match) {
      continue;
    }

    if (pattern === DATE_PATTERNS[0]) {
      const [, day, month, year] = match;
      const normalizedYear = year.length === 2 ? `20${year}` : year;
      return {
        value: { year: normalizedYear, month, day },
        confidence: 0.95,
      };
    }

    if (pattern === DATE_PATTERNS[1]) {
      const [, year, month, day] = match;
      return {
        value: { year, month, day },
        confidence: 0.95,
      };
    }

    const [, monthName, day, year] = match;
    const parsed = new Date(`${monthName} ${day}, ${year}`);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return {
      value: {
        year: String(parsed.getFullYear()),
        month: String(parsed.getMonth() + 1),
        day: String(parsed.getDate()),
      },
      confidence: 0.82,
    };
  }

  return null;
};

const parseTime = (text) => {
  const twelveHourMatch = text.match(TWELVE_HOUR_TIME_PATTERN);
  if (twelveHourMatch) {
    const hours = Number(twelveHourMatch[1]);
    const minutes = Number(twelveHourMatch[2] ?? "00");
    const meridiem = twelveHourMatch[3].toLowerCase();

    if (!hours || hours > 12 || minutes > 59) {
      return null;
    }

    return {
      value: { hours, minutes, meridiem },
      confidence: 0.93,
    };
  }

  const twentyFourHourMatch = text.match(TWENTY_FOUR_HOUR_TIME_PATTERN);
  if (twentyFourHourMatch) {
    return {
      value: {
        hours: Number(twentyFourHourMatch[1]),
        minutes: Number(twentyFourHourMatch[2]),
        meridiem: null,
      },
      confidence: 0.9,
    };
  }

  const compactTwentyFourHourMatch = text.match(TWENTY_FOUR_HOUR_COMPACT_PATTERN);
  if (compactTwentyFourHourMatch) {
    return {
      value: {
        hours: Number(compactTwentyFourHourMatch[1]),
        minutes: Number(compactTwentyFourHourMatch[2]),
        meridiem: null,
      },
      confidence: 0.92,
    };
  }

  return null;
};

const combineDateAndTime = (dateParts, timeParts) => {
  if (!dateParts) {
    return null;
  }

  let hours = 12;
  let minutes = 0;

  if (timeParts) {
    hours = timeParts.hours;
    minutes = timeParts.minutes;

    if (timeParts.meridiem === "pm" && hours !== 12) {
      hours += 12;
    }

    if (timeParts.meridiem === "am" && hours === 12) {
      hours = 0;
    }
  }

  return new Date(
    `${dateParts.year}-${String(dateParts.month).padStart(2, "0")}-${String(dateParts.day).padStart(2, "0")}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00+05:30`,
  );
};

const normalizeDescription = (description, lines) => {
  if (!description) {
    return description;
  }

  const joined = lines.join(" ").toLowerCase();

  if (joined.includes("tgspdcl") || joined.includes("electricity")) {
    return joined.includes("gruha jyothi")
      ? "TGSPDCL Gruha Jyothi Electricity Bill"
      : "Electricity Bill";
  }

  if (joined.includes("airtel")) {
    return "Airtel Bill";
  }

  if (joined.includes("jio")) {
    return "Jio Bill";
  }

  if (joined.includes("universal") && joined.includes("book")) {
    return "Universal Book Shop";
  }

  return description;
};

export const extractBillDetails = (ocrText) => {
  const normalizedText = normalizeWhitespace(ocrText);
  const lines = cleanLines(ocrText);

  const descriptionCandidates = getDescriptionCandidates(lines);
  const amountCandidates = getAmountCandidates(ocrText);
  const dateCandidate = parseDate(normalizedText);
  const timeCandidate = parseTime(normalizedText);

  const description = normalizeDescription(descriptionCandidates[0]?.value ?? null, lines);
  const amount = amountCandidates[0]?.value ?? null;
  const date = combineDateAndTime(dateCandidate?.value, timeCandidate?.value);

  const fieldConfidence = {
    description: descriptionCandidates[0]?.confidence ?? 0,
    amount: amountCandidates[0]?.confidence ?? 0,
    date: dateCandidate?.confidence ?? 0,
    time: timeCandidate?.confidence ?? 0,
  };

  const missingFields = [];

  if (!description) {
    missingFields.push("description");
  }

  if (amount === null || !Number.isFinite(amount)) {
    missingFields.push("amount");
  }

  if (!date || Number.isNaN(date.getTime())) {
    missingFields.push("date");
  }

  const lowConfidenceFields = Object.entries({
    description: fieldConfidence.description,
    amount: fieldConfidence.amount,
    date: fieldConfidence.date,
  })
    .filter(([, confidence]) => confidence > 0 && confidence < 0.65)
    .map(([field]) => field);

  return {
    description,
    amount,
    date,
    type: "DEBIT",
    rawText: ocrText,
    missingFields,
    lowConfidenceFields,
    fieldConfidence,
    descriptionCandidates: descriptionCandidates.slice(0, 3),
    amountCandidates: amountCandidates.slice(0, 3),
    needsReview: missingFields.length > 0 || lowConfidenceFields.length > 0,
  };
};
