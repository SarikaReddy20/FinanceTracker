import { createContext, useContext, useMemo, useState } from "react";

const ReportRangeContext = createContext(null);
const STORAGE_KEY = "reportDateRange";

const toInputDate = (value) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultRange = () => {
  const today = new Date();
  return {
    start: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`,
    end: toInputDate(today),
  };
};

const getStoredRange = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultRange();
    }
    const parsed = JSON.parse(raw);
    if (parsed?.start && parsed?.end) {
      return parsed;
    }
    return getDefaultRange();
  } catch {
    return getDefaultRange();
  }
};

export function ReportRangeProvider({ children }) {
  const [range, setRangeState] = useState(getStoredRange);

  const setRange = (next) => {
    setRangeState((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved));
      return resolved;
    });
  };

  const resetRange = () => {
    const fallback = getDefaultRange();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    setRangeState(fallback);
  };

  const value = useMemo(
    () => ({
      range,
      setRange,
      resetRange,
    }),
    [range],
  );

  return <ReportRangeContext.Provider value={value}>{children}</ReportRangeContext.Provider>;
}

export function useReportRange() {
  const value = useContext(ReportRangeContext);
  if (!value) {
    throw new Error("useReportRange must be used within ReportRangeProvider");
  }
  return value;
}
