const DATE_PATTERN = /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/;
const TIME_ONLY_PATTERN = /^(\d{1,2})(?:\s|:)?(\d{2})\s*(am|pm)$/i;
const INLINE_TIME_PATTERN = /\b(\d{1,2})(?:\s|:)?(\d{2})\s*(am|pm)\b/i;
const INLINE_TYPE_AMOUNT_PATTERN = /(DEBIT|CREDIT)\D*?([\d,]+(?:\.\d{1,2})?)(.*)$/i;
const DESCRIPTION_START_PATTERN =
  /^(paid to|received from|recharge|bill payment|bill|merchant payment|sent to)/i;

const sanitizeLine = (value) =>
  value
    .normalize("NFKC")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeDescription = (value) =>
  sanitizeLine(value).toLowerCase().replace(/\s+/g, " ").trim();

const normalizeTime = (rawLine) => {
  const sanitizedLine = sanitizeLine(rawLine);
  const match =
    sanitizedLine.match(TIME_ONLY_PATTERN) || sanitizedLine.match(INLINE_TIME_PATTERN);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? "00");
  const meridiem = match[3].toLowerCase();

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${meridiem}`;
};

const buildDateTime = (currentDate, currentTime) => {
  if (!currentDate) {
    return null;
  }

  return new Date(`${currentDate} ${currentTime || "12:00 am"}`);
};

const parseAmount = (rawLine) => {
  const line = sanitizeLine(rawLine);

  if (!line || /(am|pm)$/i.test(line)) {
    return null;
  }

  const inlineTypeAmountMatch = line.match(INLINE_TYPE_AMOUNT_PATTERN);
  if (inlineTypeAmountMatch) {
    return Number.parseFloat(inlineTypeAmountMatch[2].replace(/,/g, ""));
  }

  const standaloneAmountMatch = line.match(/^\D*([\d,]+(?:\.\d{1,2})?)$/);
  if (standaloneAmountMatch) {
    return Number.parseFloat(standaloneAmountMatch[1].replace(/,/g, ""));
  }

  return null;
};

const parseType = (rawLine) => {
  const line = sanitizeLine(rawLine);
  const match = line.match(/\b(DEBIT|CREDIT)\b/i);
  return match ? match[1].toUpperCase() : null;
};

export const extractTransactions = (text) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const transactions = [];

  let currentDate = null;
  let currentTime = null;

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    const line = sanitizeLine(rawLine);

    if (DATE_PATTERN.test(line)) {
      currentDate = line;
      currentTime = null;
      continue;
    }

    const detectedTime = normalizeTime(rawLine);
    if (detectedTime && TIME_ONLY_PATTERN.test(line)) {
      currentTime = detectedTime;
      continue;
    }

    const inlineTypeAmountMatch = line.match(INLINE_TYPE_AMOUNT_PATTERN);

    if (inlineTypeAmountMatch) {
      const type = inlineTypeAmountMatch[1].toUpperCase();
      const amount = Number.parseFloat(inlineTypeAmountMatch[2].replace(/,/g, ""));
      const description = inlineTypeAmountMatch[3]
        .replace(INLINE_TIME_PATTERN, "")
        .trim();

      const transactionTime = detectedTime || currentTime;
      const fullDate = buildDateTime(currentDate, transactionTime);

      if (fullDate && Number.isFinite(amount) && description) {
        transactions.push({
          date: fullDate,
          description: normalizeDescription(description),
          amount,
          type,
        });
      }

      if (detectedTime) {
        currentTime = detectedTime;
      }

      continue;
    }

    if (DESCRIPTION_START_PATTERN.test(line)) {
      const description = line;
      let type = parseType(rawLine);
      let amount = parseAmount(rawLine);
      let transactionTime = detectedTime || currentTime;

      for (let j = i + 1; j < i + 6 && j < lines.length; j += 1) {
        const nextLine = lines[j];

        if (!transactionTime) {
          const nextTime = normalizeTime(nextLine);
          if (nextTime) {
            transactionTime = nextTime;
          }
        }

        if (!type) {
          type = parseType(nextLine);
        }

        if (amount === null) {
          amount = parseAmount(nextLine);
        }

        if (type && amount !== null) {
          break;
        }
      }

      const fullDate = buildDateTime(currentDate, transactionTime);

      if (fullDate && type && amount !== null) {
        transactions.push({
          date: fullDate,
          description: normalizeDescription(description),
          amount,
          type,
        });
      }

      if (transactionTime) {
        currentTime = transactionTime;
      }
    }
  }

  return transactions;
};
