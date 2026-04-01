import { useEffect, useState } from "react";
import API from "../services/api";

import CategoryChart from "../components/CategoryChart";
import MonthlyChart from "../components/MonthlyChart";
import IncomeExpenseChart from "../components/IncomeExpenseChart";

function Dashboard() {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);

  useEffect(() => {
    API.get("/reports/category").then((res) => setCategoryData(res.data));
    API.get("/reports/monthly").then((res) => setMonthlyData(res.data));
    API.get("/reports/income-expense").then((res) => setIncomeData(res.data));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>

      <CategoryChart data={categoryData} />
      <MonthlyChart data={monthlyData} />
      <IncomeExpenseChart data={incomeData} />
    </div>
  );
}

export default Dashboard;
