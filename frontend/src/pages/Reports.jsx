import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import CategoryChart from "../components/CategoryChart";
import MonthlyChart from "../components/MonthlyChart";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import { subscribeToTransactionsUpdated } from "../utils/reportEvents";
import { useLanguage } from "../context/LanguageContext";
import { useReportRange } from "../context/ReportRangeContext";

function Reports() {
  const { t, translateCategory } = useLanguage();
  const { range, setRange } = useReportRange();
  const [granularity, setGranularity] = useState("day");
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");
        const [summaryRes, trendRes] = await Promise.all([
          API.get("/reports/summary", { params: range }),
          API.get("/reports/trend", { params: { ...range, granularity } }),
        ]);

        if (isMounted) {
          setSummary(summaryRes.data);
          setTrend(trendRes.data.data);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.response?.data?.message || t("reportsUnavailable"));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReports();
    const unsubscribe = subscribeToTransactionsUpdated(fetchReports);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [range, granularity, t]);

  const comparisonBars = useMemo(() => {
    if (!summary) {
      return [];
    }

    return [
      { label: t("currentLabel"), value: summary.comparison.current },
      { label: t("previousLabel"), value: summary.comparison.previous },
      { label: t("changeLabel"), value: Math.abs(summary.comparison.change) },
    ];
  }, [summary, t]);

  const handleDownload = async () => {
    try {
      const res = await API.get("/reports/export/pdf", {
        params: range,
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `spendsmart-report-${range.start}-to-${range.end}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert(error.response?.data?.message || t("exportFailed"));
    }
  };

  const handleRangeChange = (event) => {
    setRange((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <Layout>
      {error ? (
        <section className="surface-card report-card">
          <h3 style={{ marginTop: 0 }}>{t("reportsUnavailable")}</h3>
          <p className="subtle">{error}</p>
        </section>
      ) : null}

      <section className="glass-card hero-card">
        <div className="toolbar">
          <div>
            <div className="pill">{t("financialReports")}</div>
            <h1 className="headline" style={{ marginTop: 16 }}>
              {t("reportsHero")}
            </h1>
            <p className="subtle" style={{ maxWidth: 700, lineHeight: 1.7 }}>
              {t("reportsCopy")}
            </p>
          </div>

          <div className="report-card surface-card">
            <div className="filters">
              <input
                className="field"
                type="date"
                name="start"
                value={range.start}
                onChange={handleRangeChange}
              />
              <input
                className="field"
                type="date"
                name="end"
                value={range.end}
                onChange={handleRangeChange}
              />
              <button className="button-primary" onClick={handleDownload}>
                {t("exportPdf")}
              </button>
              <select
                className="field"
                value={granularity}
                onChange={(event) => setGranularity(event.target.value)}
              >
                <option value="day">{t("daily")}</option>
                <option value="week">{t("weekly")}</option>
                <option value="month">{t("monthly")}</option>
                <option value="year">{t("yearly")}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {loading && !summary ? (
        <div className="surface-card report-card">
          <h3 style={{ marginTop: 0 }}>{t("reportsLoadingTitle")}</h3>
          <p className="subtle">{t("reportsLoadingCopy")}</p>
        </div>
      ) : null}

      {summary ? (
        <>
          <section className="metric-grid">
            <div className="surface-card metric-card">
              <div className="subtle">{t("selectedRangeExpense")}</div>
              <p className="metric-value">
                Rs {summary.totals.totalExpense.toFixed(2)}
              </p>
            </div>
            <div className="surface-card metric-card">
              <div className="subtle">{t("selectedRangeIncome")}</div>
              <p className="metric-value">
                Rs {summary.totals.totalIncome.toFixed(2)}
              </p>
            </div>
            <div className="surface-card metric-card">
              <div className="subtle">{t("balance")}</div>
              <p className="metric-value">
                Rs {summary.totals.balance.toFixed(2)}
              </p>
            </div>
            <div className="surface-card metric-card">
              <div className="subtle">{t("transactions")}</div>
              <p className="metric-value">{summary.totals.transactionsCount}</p>
            </div>
          </section>

          <section className="chart-grid">
            <div className="chart-span-7">
              <MonthlyChart
                data={trend}
                title={`${t(granularity === "day" ? "daily" : granularity === "week" ? "weekly" : granularity === "month" ? "monthly" : "yearly")} ${t("trendTitleSuffix")}`}
                subtitle={t("trendSelectedRangeSubtitle")}
              />
            </div>
            <div className="chart-span-5">
              <CategoryChart
                data={summary.categories}
                title={t("categoryBreakdown")}
              />
            </div>
            <div className="chart-span-6">
              <MonthlyChart
                data={summary.summaries.monthly}
                title={t("monthlySummaryTitle")}
                subtitle={t("monthlySummarySubtitle")}
              />
            </div>
            <div className="chart-span-6">
              <IncomeExpenseChart
                data={comparisonBars}
                title={t("periodComparisonTitle")}
                subtitle={`${t("currentLabel")} vs ${t("previousLabel")}: ${summary.comparison.changePercent.toFixed(2)}% ${t(summary.comparison.trend === "up" ? "trendUp" : summary.comparison.trend === "down" ? "trendDown" : "trendFlat")}`}
              />
            </div>
          </section>

          <section className="surface-card report-card">
            <h3 style={{ marginTop: 0 }}>{t("categoryBreakdown")}</h3>
            <div className="table-list" style={{ marginTop: 18 }}>
              {summary.categories.map((item) => (
                <div className="table-row" key={item.category}>
                  <div>
                    <strong>{translateCategory(item.category)}</strong>
                    <div className="subtle">
                      {item.percentage.toFixed(2)}% {t("totalExpensesShare")}
                    </div>
                  </div>
                  <div className="subtle">{t("contribution")}</div>
                  <div style={{ fontWeight: 700 }}>
                    Rs {item.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </Layout>
  );
}

export default Reports;
