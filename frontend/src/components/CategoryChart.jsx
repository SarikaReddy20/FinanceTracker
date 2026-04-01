import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

function CategoryChart({ data }) {
  return (
    <PieChart width={400} height={400}>
      <Pie data={data} dataKey="total" nameKey="_id">
        {data.map((_, i) => (
          <Cell key={i} fill={COLORS[i % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}

export default CategoryChart;
