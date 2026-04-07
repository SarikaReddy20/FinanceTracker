import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import ChatbotWidget from "./ChatbotWidget";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <div className="page-shell">
        <nav className="glass-card" style={styles.nav}>
          <div>
            <div className="pill">{t("appName")}</div>
            <h2 style={styles.brandTitle}>Know where your money flows.</h2>
          </div>

          <div className="nav-links">
            <Link className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`} to="/dashboard">
              {t("navDashboard")}
            </Link>
            <Link className={`nav-link ${location.pathname === "/reports" ? "active" : ""}`} to="/reports">
              {t("navReports")}
            </Link>
            <Link className={`nav-link ${location.pathname === "/upload" ? "active" : ""}`} to="/upload">
              {t("navPdf")}
            </Link>
            <Link className={`nav-link ${location.pathname === "/upload-bill" ? "active" : ""}`} to="/upload-bill">
              {t("navBill")}
            </Link>
            <Link className={`nav-link ${location.pathname === "/manual-entry" ? "active" : ""}`} to="/manual-entry">
              {t("navManual")}
            </Link>
            <Link className={`nav-link ${location.pathname === "/goals" ? "active" : ""}`} to="/goals">
              {t("navGoals")}
            </Link>
            <Link className={`nav-link ${location.pathname === "/settings" ? "active" : ""}`} to="/settings">
              {t("navSettings")}
            </Link>
            <button className="button-primary" onClick={logout}>{t("logout")}</button>
          </div>
        </nav>

        <main style={styles.container}>{children}</main>
        <ChatbotWidget />
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
