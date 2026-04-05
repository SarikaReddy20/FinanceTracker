import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import CategoryChart from "../components/CategoryChart";
import MonthlyChart from "../components/MonthlyChart";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import Layout from "../components/Layout";
import { subscribeToTransactionsUpdated } from "../utils/reportEvents";

const toInputDate = (value) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getMonthRange = () => {
  const now = new Date();

  return {
    start: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
    end: toInputDate(now),
  };
};

function Dashboard() {
  const [range, setRange] = useState(getMonthRange);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setError(err.response?.data?.message || "Failed to load dashboard");
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
  }, [range]);

  const comparisonChartData = useMemo(() => {
    if (!report) {
      return [];
    }

    return [
      { label: "Income", value: report.totals.totalIncome },
      { label: "Expense", value: report.totals.totalExpense },
      { label: "Prev Period", value: report.comparison.previous },
      { label: "Current Period", value: report.comparison.current },
    ];
  }, [report]);

  const handleRangeChange = (event) => {
    setRange((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  if (loading && !report) {
    return (
      <Layout>
        <div className="surface-card hero-card">
          <h2 style={{ marginTop: 0 }}>Loading dashboard...</h2>
          <p className="subtle">Crunching your latest financial trends.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {error ? (
        <section className="surface-card report-card">
          <h3 style={{ marginTop: 0 }}>Dashboard unavailable</h3>
          <p className="subtle">{error}</p>
        </section>
      ) : null}

      <section className="glass-card hero-card">
        <div className="toolbar">
          <div>
            <div className="pill">Financial Command Center</div>
            <h1 className="headline" style={{ marginTop: 16 }}>
              See how your money is moving, where it goes, and what changed.
            </h1>
            <p className="subtle" style={{ maxWidth: 700, lineHeight: 1.7 }}>
              Track spending trends, compare periods, and surface your most important money insights in one place.
            </p>
          </div>

          <div className="report-card surface-card">
            <div className="filters">
              <input className="field" type="date" name="start" value={range.start} onChange={handleRangeChange} />
              <input className="field" type="date" name="end" value={range.end} onChange={handleRangeChange} />
            </div>
          </div>
        </div>
      </section>

      <section className="metric-grid">
        <div className="surface-card metric-card">
          <div className="subtle">Total Expense</div>
          <p className="metric-value">Rs {report?.totals?.totalExpense?.toFixed(2) ?? "0.00"}</p>
        </div>
        <div className="surface-card metric-card">
          <div className="subtle">Total Income</div>
          <p className="metric-value">Rs {report?.totals?.totalIncome?.toFixed(2) ?? "0.00"}</p>
        </div>
        <div className="surface-card metric-card">
          <div className="subtle">Balance</div>
          <p className="metric-value">Rs {report?.totals?.balance?.toFixed(2) ?? "0.00"}</p>
        </div>
        <div className="surface-card metric-card">
          <div className="subtle">Transactions</div>
          <p className="metric-value">{report?.totals?.transactionsCount ?? 0}</p>
        </div>
      </section>

      <section className="metric-grid">
        <div className="glass-card metric-card">
          <div className="subtle">Top category</div>
          <p className="metric-value" style={{ fontSize: "1.5rem" }}>{report?.insights?.topCategory || "No spending data"}</p>
          <p className="subtle" style={{ marginBottom: 0 }}>Rs {report?.insights?.topCategorySpend?.toFixed(2) ?? "0.00"}</p>
        </div>
        <div className="glass-card metric-card">
          <div className="subtle">Average daily spend</div>
          <p className="metric-value">Rs {report?.insights?.averageDailySpend?.toFixed(2) ?? "0.00"}</p>
        </div>
        <div className="glass-card metric-card">
          <div className="subtle">Trend vs previous period</div>
          <p className="metric-value" style={{ color: report?.comparison?.trend === "up" ? "var(--danger)" : "var(--brand-strong)" }}>
            {report?.comparison?.changePercent?.toFixed(2) ?? "0.00"}%
          </p>
          <p className="subtle" style={{ marginBottom: 0 }}>
            {(report?.comparison?.change ?? 0) >= 0 ? "+" : ""}Rs {report?.comparison?.change?.toFixed(2) ?? "0.00"}
          </p>
        </div>
      </section>

      <section className="chart-grid">
        <div className="chart-span-7">
          <MonthlyChart
            data={report?.summaries?.daily || []}
            title="Daily Trend"
            subtitle="Daily expenses and income in the selected date range."
          />
        </div>
        <div className="chart-span-5">
          <CategoryChart data={report?.categories || []} />
        </div>
        <div className="chart-span-6">
          <MonthlyChart
            data={report?.summaries?.weekly || []}
            title="Weekly View"
            subtitle="Weekly grouped movement for quick pattern recognition."
          />
        </div>
        <div className="chart-span-6">
          <IncomeExpenseChart
            data={comparisonChartData}
            title="Income / Expense Snapshot"
            subtitle="Compare your current range against the previous period."
          />
        </div>
      </section>

      <section className="surface-card report-card">
        <div className="toolbar">
          <div>
            <h3 style={{ margin: 0 }}>Recent Transactions</h3>
            <p className="subtle" style={{ margin: "6px 0 0" }}>Latest items from the selected range.</p>
          </div>
        </div>

        {report?.recentTransactions?.length ? (
          <div className="table-list" style={{ marginTop: 18 }}>
            {report.recentTransactions.map((item) => (
              <div className="table-row" key={item._id}>
                <div>
                  <strong>{item.description}</strong>
                  <div className="subtle">{item.category}</div>
                </div>
                <div>
                  {item.displayDate || new Date(item.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  <div className="subtle">{item.displayTime || ""}</div>
                </div>
                <div style={{ fontWeight: 700, color: item.type === "CREDIT" ? "var(--brand-strong)" : "var(--text)" }}>
                  Rs {item.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No transactions found for this range.</div>
        )}
      </section>
    </Layout>
  );
}

export default Dashboard;
