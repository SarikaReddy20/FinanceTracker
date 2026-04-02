import { useEffect, useState } from "react";
import API from "../services/api";

import CategoryChart from "../components/CategoryChart";
import MonthlyChart from "../components/MonthlyChart";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import Layout from "../components/Layout";

function Dashboard() {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, m, i] = await Promise.all([
          API.get("/reports/category"),
          API.get("/reports/monthly"),
          API.get("/reports/income-expense"),
        ]);

        setCategoryData(c.data);
        setMonthlyData(m.data);
        setIncomeData(i.data);
      } catch (err) {
        alert("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <h3>Loading dashboard...</h3>;

  return (
    <Layout>
      <h2>Dashboard</h2>

      <CategoryChart data={categoryData} />
      <MonthlyChart data={monthlyData} />
      <IncomeExpenseChart data={incomeData} />
    </Layout>
  );
}

export default Dashboard;
