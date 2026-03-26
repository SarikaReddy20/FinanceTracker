export const extractTransactions = (text) => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  const transactions = [];

  let currentDate = null;

  lines.forEach((line) => {
    // 1️⃣ Detect Date (Mar 22, 2026)
    const dateMatch = line.match(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);

    if (dateMatch) {
      currentDate = new Date(line);
      return;
    }

    // 2️⃣ Detect transaction line (YOUR FORMAT)
    if (line.includes("DEBIT₹") || line.includes("CREDIT₹")) {
      // Extract type
      const type = line.includes("DEBIT₹") ? "DEBIT" : "CREDIT";

      // Extract amount (₹64 or ₹25,000)
      const amountMatch = line.match(/₹([\d,]+)/);

      const amount = amountMatch
        ? parseFloat(amountMatch[1].replace(/,/g, ""))
        : 0;

      // Extract description (after amount)
      let description = line.replace(/^(DEBIT₹|CREDIT₹)[\d,]+/, "").trim();

      transactions.push({
        date: currentDate || new Date(),
        description,
        amount,
        type,
      });
    }
  });

  return transactions;
};
