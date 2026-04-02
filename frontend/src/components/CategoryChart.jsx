import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function CategoryChart({ data }) {
  if (!data.length) return <p>No data</p>;

  return (
    <PieChart width={400} height={400}>
      <Pie data={data} dataKey="total" nameKey="_id">
        {data.map((_, i) => (
          <Cell key={i} fill={COLORS[i % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}

export default CategoryChart;
