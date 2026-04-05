import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card glass-card">
        <div className="auth-panel" style={styles.hero}>
          <div className="pill">SpendSmart Analytics</div>
          <h1 className="headline" style={{ marginTop: 18 }}>
            Turn receipts, statements, and spending into a clear money story.
          </h1>
          <p className="subtle" style={styles.copy}>
            Upload PDFs and bills, track trends over time, compare periods, and get a dashboard that actually helps you make better decisions.
          </p>
          <button className="button-secondary" onClick={toggleTheme} style={{ width: "fit-content" }}>
            {theme === "light" ? "Switch to Dark" : "Switch to Light"}
          </button>
        </div>

        <div className="auth-panel surface-card" style={styles.formPanel}>
          <div className="pill">{theme === "light" ? "Green Light Theme" : "Deep Green Night Theme"}</div>
          <h2 style={{ marginBottom: 8 }}>Welcome back</h2>
          <p className="subtle" style={{ marginTop: 0 }}>Log in to view your financial dashboard, reports, and upload tools.</p>

          <div className="auth-form">
            <input className="field" name="email" placeholder="Email" onChange={handleChange} />
            <input className="field" name="password" type="password" placeholder="Password" onChange={handleChange} />
            <button className="button-primary" onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <button className="button-secondary" onClick={() => navigate("/register")}>
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    display: "grid",
    alignContent: "space-between",
    gap: 18,
  },
  copy: {
    maxWidth: 460,
    fontSize: "1.02rem",
    lineHeight: 1.7,
  },
  formPanel: {
    margin: 18,
    borderRadius: 28,
  },
};

export default Login;
