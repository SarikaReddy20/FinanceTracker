import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <div className="page-shell">
        <nav className="glass-card" style={styles.nav}>
          <div>
            <div className="pill">SpendSmart</div>
            <h2 style={styles.brandTitle}>Know where your money flows.</h2>
          </div>

          <div className="nav-links">
            <Link className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`} to="/dashboard">
              Dashboard
            </Link>
            <Link className={`nav-link ${location.pathname === "/reports" ? "active" : ""}`} to="/reports">
              Reports
            </Link>
            <Link className={`nav-link ${location.pathname === "/upload" ? "active" : ""}`} to="/upload">
              PDF Upload
            </Link>
            <Link className={`nav-link ${location.pathname === "/upload-bill" ? "active" : ""}`} to="/upload-bill">
              Bill OCR
            </Link>
            <button className="button-secondary" onClick={toggleTheme}>
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
            <button className="button-primary" onClick={logout}>Logout</button>
          </div>
        </nav>

        <main style={styles.container}>{children}</main>
      </div>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    padding: "20px 24px",
    borderRadius: 28,
    marginBottom: 22,
  },
  brandTitle: {
    margin: "10px 0 0",
    fontSize: "1.1rem",
  },
  container: {
    display: "grid",
    gap: 20,
  },
};

export default Layout;
