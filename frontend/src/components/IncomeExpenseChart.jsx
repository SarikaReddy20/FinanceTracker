import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLanguage } from "../context/LanguageContext";

function IncomeExpenseChart({ data, title, subtitle }) {
  const { t } = useLanguage();
  const resolvedTitle = title || t("comparisonSnapshotTitle");
  const resolvedSubtitle = subtitle || t("comparisonSnapshotSubtitle");

  if (!data?.length) {
    return <div className="empty-state">{t("noComparisonData")}</div>;
  }

  return (
    <div className="surface-card chart-card">
      <h3 style={{ margin: 0 }}>{resolvedTitle}</h3>
      <p className="subtle" style={{ margin: "6px 0 18px" }}>{resolvedSubtitle}</p>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(120, 160, 135, 0.18)" strokeDasharray="4 4" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip formatter={(value) => `Rs ${Number(value).toFixed(2)}`} />
          <Bar dataKey="value" fill="#1f8f5f" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default IncomeExpenseChart;
