export const extractTransactions = (text) => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  const transactions = [];

  let currentDate = null;
  let currentTime = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1️⃣ Detect Date
    if (/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(line)) {
      currentDate = line;
      continue;
    }

    // 2️⃣ Detect Time
    if (/^\d{3,4} (am|pm)$/i.test(line)) {
      currentTime = line;
      continue;
    }

    // 🔥 FORMAT 1: Single line (DEBIT₹64Paid to...)
    if (line.includes("DEBIT₹") || line.includes("CREDIT₹")) {
      const type = line.includes("DEBIT₹") ? "DEBIT" : "CREDIT";

      const amountMatch = line.match(/₹([\d,]+)/);
      const amount = amountMatch
        ? parseFloat(amountMatch[1].replace(/,/g, ""))
        : 0;

      let description = line.replace(/^(DEBIT₹|CREDIT₹)[\d,]+/, "").trim();

      let formattedTime = currentTime
        ? currentTime.replace(/(\d{1,2})(\d{2})/, "$1:$2")
        : "00:00 am";

      const fullDate = new Date(`${currentDate} ${formattedTime}`);

      transactions.push({
        date: fullDate,
        description: description.toLowerCase().replace(/\s+/g, " ").trim(),
        amount,
        type,
      });

      continue;
    }

    // 🔥 FORMAT 2: Multi-line (Paid to... → DEBIT → ₹)
    if (
      line.toLowerCase().startsWith("paid to") ||
      line.toLowerCase().startsWith("received from") ||
      line.toLowerCase().includes("recharge") ||
      line.toLowerCase().includes("bill")
    ) {
      let description = line;
      let type = null;
      let amount = null;

      for (let j = i + 1; j < i + 6 && j < lines.length; j++) {
        if (lines[j] === "DEBIT" || lines[j] === "CREDIT") {
          type = lines[j];
        }

        if (lines[j].includes("₹")) {
          const match = lines[j].match(/₹([\d,]+)/);
          if (match) {
            amount = parseFloat(match[1].replace(/,/g, ""));
          }
        }

        if (type && amount) break;
      }

      if (type && amount) {
        let formattedTime = currentTime
          ? currentTime.replace(/(\d{1,2})(\d{2})/, "$1:$2")
          : "00:00 am";

        const fullDate = new Date(`${currentDate} ${formattedTime}`);

        transactions.push({
          date: fullDate,
          description: description.toLowerCase().replace(/\s+/g, " ").trim(),
          amount,
          type,
        });
      }
    }
  }

  return transactions;
};
