import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#1f8f5f", "#74d69b", "#0e5a39", "#b7efc5", "#95d5b2", "#2d6a4f", "#40916c"];

function CategoryChart({ data, title = "Category Share" }) {
  if (!data?.length) {
    return <div className="empty-state">No category data available for this range.</div>;
  }

  return (
    <div className="surface-card chart-card">
      <div className="toolbar" style={{ marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <p className="subtle" style={{ margin: "6px 0 0" }}>
            Percentage contribution of each expense category.
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
          <Tooltip formatter={(value) => [`Rs ${Number(value).toFixed(2)}`, "Spend"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategoryChart;
