import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import CategoryChart from "../components/CategoryChart";
import MonthlyChart from "../components/MonthlyChart";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import Layout from "../components/Layout";
import { notifyTransactionsUpdated, subscribeToTransactionsUpdated } from "../utils/reportEvents";
import { useLanguage } from "../context/LanguageContext";
import { useReportRange } from "../context/ReportRangeContext";

const CATEGORY_OPTIONS = [
  "Food",
  "Groceries",
  "Travel",
  "Shopping",
  "Bills",
  "Entertainment",
  "Education",
  "Health",
  "Reimbursable",
  "Income",
  "Uncategorized",
];

const isUncategorizedTransaction = (item) => !item?.categorized || item?.category === "Uncategorized";

function Dashboard() {
  const { t, translateCategory, translateHealthLabel } = useLanguage();
  const { range, setRange } = useReportRange();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterMode, setFilterMode] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [transactionsPage, setTransactionsPage] = useState(0);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(false);
  const [loadingMoreTransactions, setLoadingMoreTransactions] = useState(false);

  const [goals, setGoals] = useState([]);
  const [goalsHidden, setGoalsHidden] = useState(() => localStorage.getItem("dashboardGoalsHidden") === "true");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get("/reports/dashboard", { params: range });
        if (isMounted) {
          setReport(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || t("dashboardUnavailable"));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    const unsubscribe = subscribeToTransactionsUpdated(fetchData);
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [range, t]);

  useEffect(() => {
    let isMounted = true;
    const loadGoals = async () => {
      try {
        const res = await API.get("/goals");
        if (isMounted) {
          setGoals(res.data.goals || []);
        }
      } catch {
        if (isMounted) {
          setGoals([]);
        }
      }
    };
    loadGoals();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchTransactions = async (pageToLoad, append = false) => {
    try {
      setLoadingMoreTransactions(true);
      const params = {
        ...range,
        page: pageToLoad,
        limit: pageToLoad === 1 ? 10 : 20,
      };

      if (filterMode === "category" && selectedCategory) {
        params.category = selectedCategory;
      }
      if (filterMode === "uncategorized") {
        params.filterType = "uncategorized";
      }

      const res = await API.get("/reports/transactions", { params });
      const nextItems = res.data.transactions || [];

      setTransactions((current) => {
        if (!append) {
          return nextItems;
        }
        const merged = [...current, ...nextItems];
        const unique = [];
        const seen = new Set();
        for (const item of merged) {
          if (seen.has(item._id)) {
            continue;
          }
          seen.add(item._id);
          unique.push(item);
        }
        return unique;
      });
      setTransactionsPage(pageToLoad);
      setHasMoreTransactions(Boolean(res.data.hasMore));
    } catch (err) {
      setError(err.response?.data?.message || t("dashboardUnavailable"));
    } finally {
      setLoadingMoreTransactions(false);
    }
  };

  useEffect(() => {
    if (filterMode !== "category") {
      setSelectedCategory("");
    }
  }, [filterMode]);

  useEffect(() => {
    fetchTransactions(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, filterMode, selectedCategory]);

  const comparisonChartData = useMemo(() => {
    if (!report) {
      return [];
    }
    return [
      { label: t("incomeSeries"), value: report.totals.totalIncome },
      { label: t("expenseSeries"), value: report.totals.totalExpense },
      { label: t("previousLabel"), value: report.comparison.previous },
      { label: t("currentLabel"), value: report.comparison.current },
    ];
  }, [report, t]);

  const handleRangeChange = (event) => {
    setRange((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCategorizeUncategorized = async (transactionId, nextCategory) => {
    if (!nextCategory) {
      return;
    }
    try {
      await API.put(`/transactions/update-category/${transactionId}`, { category: nextCategory });
      setTransactions((current) => current
        .map((item) => (item._id === transactionId
          ? { ...item, category: nextCategory, categorized: true }
          : item))
        .filter((item) => (filterMode === "uncategorized" ? isUncategorizedTransaction(item) : true)));
      notifyTransactionsUpdated();
    } catch (err) {
      setError(err.response?.data?.message || t("dashboardUnavailable"));
    }
  };

  if (loading && !report) {
    return (
      <Layout>
        <div className="surface-card hero-card">
          <h2 style={{ marginTop: 0 }}>{t("dashboardLoadTitle")}</h2>
          <p className="subtle">{t("dashboardLoadCopy")}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {error ? (
        <section className="surface-card report-card">
          <h3 style={{ marginTop: 0 }}>{t("dashboardUnavailable")}</h3>
          <p className="subtle">{error}</p>
        </section>
      ) : null}

      <section className="glass-card hero-card">
        <div className="toolbar">
          <div>
            <div className="pill">{t("financialCommandCenter")}</div>
            <h1 className="headline" style={{ marginTop: 16 }}>
              {t("dashboardHero")}
            </h1>
            <p className="subtle" style={{ maxWidth: 700, lineHeight: 1.7 }}>
              {t("dashboardCopy")}
            </p>
          </div>

          <div className="report-card surface-card" style={{ minWidth: 380 }}>
            <div className="filters">
              <input className="field" type="date" name="start" value={range.start} onChange={handleRangeChange} />
              <input className="field" type="date" name="end" value={range.end} onChange={handleRangeChange} />
            </div>

            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <strong>{t("dashboardGoalsTitle")}</strong>
              <button
                className="button-secondary"
                onClick={() => {
                  const next = !goalsHidden;
                  setGoalsHidden(next);
                  localStorage.setItem("dashboardGoalsHidden", String(next));
                }}
              >
                {goalsHidden ? t("showGoals") : t("hideGoals")}
              </button>
            </div>

            {!goalsHidden ? (
              goals.length ? (
                <div className="table-list" style={{ marginTop: 10 }}>
                  {goals.slice(0, 3).map((goal) => {
                    const remainingDays = Math.max(
                      Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                      0,
                    );
                    return (
                      <div key={goal._id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px" }}>
                        <strong>{goal.title}</strong>
                        <div className="subtle">{t("progress")}: {Number(goal.progressPercent || 0).toFixed(1)}%</div>
                        <div className="subtle">{remainingDays} {t("daysRemaining")}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="subtle" style={{ marginTop: 10 }}>{t("noGoalsYet")}</div>
              )
            ) : null}
          </div>
        </div>
      </section>

      <section className="metric-grid">
        <div className="surface-card metric-card">
          <div className="subtle">{t("totalExpense")}</div>
          <p className="metric-value">Rs {report?.totals?.totalExpense?.toFixed(2) ?? "0.00"}</p>
        </div>
        <div className="surface-card metric-card">
          <div className="subtle">{t("totalIncome")}</div>
          <p className="metric-value">Rs {report?.totals?.totalIncome?.toFixed(2) ?? "0.00"}</p>
        </div>
        <div className="surface-card metric-card">
          <div className="subtle">{t("balance")}</div>
          <p className="metric-value">Rs {report?.totals?.balance?.toFixed(2) ?? "0.00"}</p>
        </div>
        <div className="surface-card metric-card">
          <div className="subtle">{t("transactions")}</div>
          <p className="metric-value">{report?.totals?.transactionsCount ?? 0}</p>
        </div>
      </section>

      <section className="metric-grid">
        <div className="glass-card metric-card">
          <div className="subtle">{t("financialHealthScore")}</div>
          <p className="metric-value">{report?.insights?.financialHealth?.score ?? 0}/100</p>
          <p className="subtle" style={{ marginBottom: 10 }}>
            {report?.insights?.financialHealth?.label
              ? translateHealthLabel(report.insights.financialHealth.label)
              : t("notEnoughData")}
          </p>
          <div className="score-bar">
            <div className="score-fill" style={{ width: `${report?.insights?.financialHealth?.score ?? 0}%` }} />
          </div>
        </div>
        <div className="glass-card metric-card">
          <div className="subtle">{t("topCategory")}</div>
          <p className="metric-value" style={{ fontSize: "1.5rem" }}>
            {report?.insights?.topCategory ? translateCategory(report.insights.topCategory) : t("noSpendingData")}
          </p>
          <p className="subtle" style={{ marginBottom: 0 }}>Rs {report?.insights?.topCategorySpend?.toFixed(2) ?? "0.00"}</p>
        </div>
        <div className="glass-card metric-card">
          <div className="subtle">{t("averageDailySpend")}</div>
          <p className="metric-value">Rs {report?.insights?.averageDailySpend?.toFixed(2) ?? "0.00"}</p>
        </div>
        <div className="glass-card metric-card">
          <div className="subtle">{t("whyThisScore")}</div>
          <p className="subtle" style={{ margin: "10px 0 6px" }}>
            {t("savingsRatio")}: {report?.insights?.financialHealth?.factors?.savingsRatio?.toFixed(2) ?? "0.00"}%
          </p>
          <p className="subtle" style={{ margin: "0 0 6px" }}>
            {t("overspendingFrequency")}: {report?.insights?.financialHealth?.factors?.overspendingFrequency?.toFixed(2) ?? "0.00"}%
          </p>
          <p className="subtle" style={{ margin: 0 }}>
            {t("categoryBalanceScore")}: {report?.insights?.financialHealth?.factors?.categoryBalance?.toFixed(2) ?? "0.00"}%
          </p>
        </div>
      </section>

      <section className="surface-card report-card">
        <h3 style={{ marginTop: 0 }}>{t("smartInsightsSummaryTitle")}</h3>
        <p className="subtle" style={{ marginBottom: 0 }}>
          {report?.insights?.smartSummary || t("smartInsightsSummaryFallback")}
        </p>
      </section>

      <section className="chart-grid">
        <div className="chart-span-7">
          <MonthlyChart data={report?.summaries?.daily || []} title={t("dailyTrendTitle")} subtitle={t("dailyTrendSubtitle")} />
        </div>
        <div className="chart-span-5">
          <CategoryChart data={report?.categories || []} />
        </div>
        <div className="chart-span-6">
          <MonthlyChart data={report?.summaries?.weekly || []} title={t("weeklyViewTitle")} subtitle={t("weeklyViewSubtitle")} />
        </div>
        <div className="chart-span-6">
          <IncomeExpenseChart data={comparisonChartData} title={t("incomeExpenseSnapshotTitle")} subtitle={t("incomeExpenseSnapshotSubtitle")} />
        </div>
      </section>

      <section className="surface-card report-card">
        <div className="toolbar">
          <div>
            <h3 style={{ margin: 0 }}>{t("recentTransactions")}</h3>
            <p className="subtle" style={{ margin: "6px 0 0" }}>{t("latestItems")}</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select className="field" value={filterMode} onChange={(event) => setFilterMode(event.target.value)}>
              <option value="all">{t("filterAll")}</option>
              <option value="category">{t("filterCategoryWise")}</option>
              <option value="uncategorized">{t("filterUncategorized")}</option>
            </select>
            {filterMode === "category" ? (
              <select className="field" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                <option value="">{t("allCategories")}</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option value={option} key={option}>{translateCategory(option)}</option>
                ))}
              </select>
            ) : null}
          </div>
        </div>

        {transactions.length ? (
          <div className="table-list" style={{ marginTop: 18 }}>
            {transactions.map((item) => (
              <div className="table-row" key={item._id}>
                <div>
                  <strong>{item.description}</strong>
                  <div className="subtle">{translateCategory(item.category)}</div>
                </div>
                <div>
                  {item.displayDate || new Date(item.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  <div className="subtle">{item.displayTime || ""}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <strong style={{ color: item.type === "CREDIT" ? "var(--brand-strong)" : "var(--text)" }}>
                    Rs {Number(item.amount).toFixed(2)}
                  </strong>
                  {filterMode === "uncategorized" && isUncategorizedTransaction(item) ? (
                    <select className="field" style={{ minWidth: 140 }} onChange={(event) => handleCategorizeUncategorized(item._id, event.target.value)} defaultValue="">
                      <option value="">{t("edit")}</option>
                      {CATEGORY_OPTIONS.filter((category) => category !== "Uncategorized").map((category) => (
                        <option value={category} key={category}>{translateCategory(category)}</option>
                      ))}
                    </select>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">{t("noTransactions")}</div>
        )}

        <div className="toolbar" style={{ marginTop: 14 }}>
          {hasMoreTransactions ? (
            <button className="button-secondary" disabled={loadingMoreTransactions} onClick={() => fetchTransactions(transactionsPage + 1, true)}>
              {loadingMoreTransactions ? "..." : t("viewMore")}
            </button>
          ) : null}
        </div>
      </section>
    </Layout>
  );
}

export default Dashboard;
