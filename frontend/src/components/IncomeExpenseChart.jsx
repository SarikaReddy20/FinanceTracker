import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

function IncomeExpenseChart({ data }) {
  return (
    <BarChart width={500} height={300} data={data}>
      <XAxis dataKey="_id" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="total" />
    </BarChart>
  );
}

export default IncomeExpenseChart;
