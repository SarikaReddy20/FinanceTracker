import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useLanguage } from "../context/LanguageContext";

const COLORS = ["#1f8f5f", "#74d69b", "#0e5a39", "#b7efc5", "#95d5b2", "#2d6a4f", "#40916c"];

function CategoryChart({ data, title }) {
  const { t, translateCategory } = useLanguage();
  const resolvedTitle = title || t("categoryShareTitle");

  if (!data?.length) {
    return <div className="empty-state">{t("noCategoryData")}</div>;
  }

  return (
    <div className="surface-card chart-card">
      <div className="toolbar" style={{ marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: 0 }}>{resolvedTitle}</h3>
          <p className="subtle" style={{ margin: "6px 0 0" }}>
            {t("categoryShareSubtitle")}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            innerRadius={64}
            outerRadius={108}
            paddingAngle={2}
          >
            {data.map((item, index) => (
              <Cell key={`${item.category}-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, item) => [`Rs ${Number(value).toFixed(2)}`, t("spendLegend")]}
            labelFormatter={(label) => translateCategory(label)}
          />
          <Legend formatter={(value) => translateCategory(value)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategoryChart;
