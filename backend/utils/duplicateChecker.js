import Transaction from "../models/Transaction.js";

// 🔥 Normalize description (SAFE VERSION)
const normalize = (text) => {
  return text
    .toLowerCase()
    .replace(/paid to|received from/g, "") // remove prefixes
    .replace(/\s+/g, " ") // normalize spaces (NOT remove all)
    .trim();
};

export const isDuplicateTransaction = async ({
  userId,
  date,
  amount,
  description,
  type,
}) => {
  try {
    // 🔥 Tighter time window (30 seconds)
    const timeWindow = 30 * 1000;

    const fromTime = new Date(date.getTime() - timeWindow);
    const toTime = new Date(date.getTime() + timeWindow);

    const normalizedDesc = normalize(description);

    // 🔍 Step 1: Filter candidates (fast DB query)
    const possibleMatches = await Transaction.find({
      userId,
      amount,
      type,
      date: { $gte: fromTime, $lte: toTime },
    });

    // 🔥 Step 2: Strong comparison
    for (const tx of possibleMatches) {
      const existingDesc = normalize(tx.description);

      if (existingDesc === normalizedDesc) {
        // 🔍 Debug log (VERY USEFUL)
        console.log("DUPLICATE MATCH FOUND:");
        console.log({
          new: {
            description,
            amount,
            date,
          },
          existing: {
            description: tx.description,
            amount: tx.amount,
            date: tx.date,
          },
        });

        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Duplicate check error:", error);
    return false;
  }
};
