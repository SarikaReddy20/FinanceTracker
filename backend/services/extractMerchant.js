export const extractMerchant = (description) => {
  const lower = description.toLowerCase();

  let match = lower.match(/paid to ([a-z\s]+)/);
  if (match) return match[1].trim();

  match = lower.match(/received from ([a-z\s]+)/);
  if (match) return match[1].trim();

  return null;
};
