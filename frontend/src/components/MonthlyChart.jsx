import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function MonthlyChart({ data, title = "Trend Overview", subtitle = "Expense and income movement over time." }) {
  if (!data?.length) {
    return <div className="empty-state">No trend data available for this range.</div>;
  }

  return (
    <div className="surface-card chart-card">
      <h3 style={{ margin: 0 }}>{title}</h3>
      <p className="subtle" style={{ margin: "6px 0 18px" }}>{subtitle}</p>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(120, 160, 135, 0.18)" strokeDasharray="4 4" />
          <XAxis dataKey="period" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip formatter={(value) => `Rs ${Number(value).toFixed(2)}`} />
          <Legend />
          <Line type="monotone" dataKey="expense" stroke="#1f8f5f" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="income" stroke="#95d5b2" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyChart;
