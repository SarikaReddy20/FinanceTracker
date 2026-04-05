const IST_TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET_MINUTES = 5 * 60 + 30;

const pad = (value) => String(value).padStart(2, "0");

export const toIstISOString = (value) => {
  if (!value) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const istDate = new Date(date.getTime() + IST_OFFSET_MINUTES * 60 * 1000);

  return `${istDate.getUTCFullYear()}-${pad(istDate.getUTCMonth() + 1)}-${pad(istDate.getUTCDate())}T${pad(istDate.getUTCHours())}:${pad(istDate.getUTCMinutes())}:${pad(istDate.getUTCSeconds())}+05:30`;
};

export const formatIstDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);

export const formatIstTime = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(value);

export const serializeTransaction = (transaction) => {
  const plain = typeof transaction.toObject === "function"
    ? transaction.toObject()
    : { ...transaction };

  if (!plain.date) {
    return plain;
  }

  return {
    ...plain,
    date: toIstISOString(plain.date),
    displayDate: formatIstDate(plain.date),
    displayTime: formatIstTime(plain.date),
    timezone: IST_TIME_ZONE,
  };
};

export const serializeTransactions = (transactions = []) =>
  transactions.map(serializeTransaction);
