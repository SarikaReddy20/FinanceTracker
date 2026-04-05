import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import CategoryChart from "../components/CategoryChart";
import MonthlyChart from "../components/MonthlyChart";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import { subscribeToTransactionsUpdated } from "../utils/reportEvents";

const toInputDate = (value) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDefaultRange = () => {
  const today = new Date();
  const end = toInputDate(today);
  const previous = new Date(today);
  previous.setDate(previous.getDate() - 30);
  const start = toInputDate(previous);

  return { start, end };
};

function Reports() {
  const [range, setRange] = useState(getDefaultRange);
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
          setError(error.response?.data?.message || "Failed to load reports");
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
  }, [range, granularity]);

  const comparisonBars = useMemo(() => {
    if (!summary) {
      return [];
    }

    return [
      { label: "Current", value: summary.comparison.current },
      { label: "Previous", value: summary.comparison.previous },
      { label: "Change", value: Math.abs(summary.comparison.change) },
    ];
  }, [summary]);

  const handleDownload = async () => {
    try {
      const res = await API.get("/reports/export/pdf", {
        params: range,
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `spendsmart-report-${range.start}-to-${range.end}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to export report");
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
          <h3 style={{ marginTop: 0 }}>Reports unavailable</h3>
          <p className="subtle">{error}</p>
        </section>
      ) : null}

      <section className="glass-card hero-card">
        <div className="toolbar">
          <div>
            <div className="pill">Financial Reports</div>
            <h1 className="headline" style={{ marginTop: 16 }}>
              Explore trends by day, week, month, year, or your own custom range.
            </h1>
            <p className="subtle" style={{ maxWidth: 700, lineHeight: 1.7 }}>
              Compare current spending with previous periods, inspect category contribution, and export your report for offline reference.
            </p>
          </div>

          <div className="report-card surface-card">
            <div className="filters">
              <input className="field" type="date" name="start" value={range.start} onChange={handleRangeChange} />
              <input className="field" type="date" name="end" value={range.end} onChange={handleRangeChange} />
              <select className="field" value={granularity} onChange={(e) => setGranularity(e.target.value)}>
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
              <button className="button-primary" onClick={handleDownload}>Export PDF</button>
            </div>
          </div>
        </div>
      </section>

      {loading && !summary ? (
        <div className="surface-card report-card">
          <h3 style={{ marginTop: 0 }}>Loading reports...</h3>
          <p className="subtle">Preparing trends and financial comparisons.</p>
        </div>
      ) : null}

      {summary ? (
        <>
          <section className="metric-grid">
            <div className="surface-card metric-card">
              <div className="subtle">Selected Range Expense</div>
              <p className="metric-value">Rs {summary.totals.totalExpense.toFixed(2)}</p>
            </div>
            <div className="surface-card metric-card">
              <div className="subtle">Selected Range Income</div>
              <p className="metric-value">Rs {summary.totals.totalIncome.toFixed(2)}</p>
            </div>
            <div className="surface-card metric-card">
              <div className="subtle">Balance</div>
              <p className="metric-value">Rs {summary.totals.balance.toFixed(2)}</p>
            </div>
            <div className="surface-card metric-card">
              <div className="subtle">Transactions</div>
              <p className="metric-value">{summary.totals.transactionsCount}</p>
            </div>
          </section>

          <section className="chart-grid">
            <div className="chart-span-7">
              <MonthlyChart
                data={trend}
                title={`${granularity[0].toUpperCase()}${granularity.slice(1)} Trend`}
                subtitle="Trend breakdown for the selected custom date range."
              />
            </div>
            <div className="chart-span-5">
              <CategoryChart data={summary.categories} title="Category Percentage" />
            </div>
            <div className="chart-span-6">
              <MonthlyChart
                data={summary.summaries.monthly}
                title="Monthly Summary"
                subtitle="Month-wise overview inside the selected range."
              />
            </div>
            <div className="chart-span-6">
              <IncomeExpenseChart
                data={comparisonBars}
                title="Period Comparison"
                subtitle={`Current vs previous period: ${summary.comparison.changePercent.toFixed(2)}% ${summary.comparison.trend}`}
              />
            </div>
          </section>

          <section className="surface-card report-card">
            <h3 style={{ marginTop: 0 }}>Category Breakdown</h3>
            <div className="table-list" style={{ marginTop: 18 }}>
              {summary.categories.map((item) => (
                <div className="table-row" key={item.category}>
                  <div>
                    <strong>{item.category}</strong>
                    <div className="subtle">{item.percentage.toFixed(2)}% of total expenses</div>
                  </div>
                  <div className="subtle">Contribution</div>
                  <div style={{ fontWeight: 700 }}>Rs {item.total.toFixed(2)}</div>
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
