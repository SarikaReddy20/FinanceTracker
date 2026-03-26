import MerchantCategory from "../models/MerchantCategory.js";
import { extractMerchant } from "./extractMerchant.js";

export const detectCategory = async (description, type, userId) => {
  if (type === "CREDIT") return "Income";

  const merchant = extractMerchant(description);

  // Check memory (DB)
  if (merchant) {
    const existing = await MerchantCategory.findOne({ userId, merchant });
    if (existing) return existing.category;
  }

  const desc = description.toLowerCase();

  const categoryMap = {
    Food: ["swiggy", "zomato", "restaurant", "bakery", "cafe", "pizza", "food"],
    Travel: ["uber", "ola", "rapido", "fastag", "irctc", "bus", "train"],
    Shopping: ["amazon", "flipkart", "myntra", "meesho", "shop"],
    Bills: ["airtel", "jio", "electricity", "recharge", "bill", "broadband"],
    Entertainment: ["netflix", "prime", "hotstar", "saavn", "spotify"],
    Education: ["school", "college", "fee", "cbit"],
    Health: ["hospital", "medical", "pharmacy"],
  };

  for (const category in categoryMap) {
    for (const keyword of categoryMap[category]) {
      if (desc.includes(keyword)) return category;
    }
  }

  return null;
};
