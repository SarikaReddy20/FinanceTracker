import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      await API.post("/auth/register", form);
      alert("Registered successfully");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card glass-card">
        <div className="auth-panel" style={styles.hero}>
          <div className="pill">Create Your Workspace</div>
          <h1 className="headline" style={{ marginTop: 18 }}>
            Build your own personal finance cockpit.
          </h1>
          <p className="subtle" style={styles.copy}>
            Start with automated uploads, then explore category breakdowns, daily and monthly trends, and downloadable reports inside a dashboard built around clarity.
          </p>
          <button className="button-secondary" onClick={toggleTheme} style={{ width: "fit-content" }}>
            {theme === "light" ? "Switch to Dark" : "Switch to Light"}
          </button>
        </div>

        <div className="auth-panel surface-card" style={styles.formPanel}>
          <div className="pill">{theme === "light" ? "Fresh Green Mode" : "Forest Dark Mode"}</div>
          <h2 style={{ marginBottom: 8 }}>Create account</h2>
          <p className="subtle" style={{ marginTop: 0 }}>Register once, then log in to access the dashboard and report center.</p>

          <div className="auth-form">
            <input className="field" name="name" placeholder="Name" onChange={handleChange} />
            <input className="field" name="email" placeholder="Email" onChange={handleChange} />
            <input className="field" name="password" type="password" placeholder="Password" onChange={handleChange} />
            <button className="button-primary" onClick={handleRegister} disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
            <button className="button-secondary" onClick={() => navigate("/")}>
              Back to login
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

export default Register;
