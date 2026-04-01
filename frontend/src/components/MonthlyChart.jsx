import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

function MonthlyChart({ data }) {
  return (
    <LineChart width={500} height={300} data={data}>
      <XAxis dataKey="_id" />
      <YAxis />
      <Tooltip />
      <Line dataKey="total" />
    </LineChart>
  );
}

export default MonthlyChart;