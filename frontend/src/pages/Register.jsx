import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

function Register() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguagePreference, supportedLanguages } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", password: "", preferredLanguage: language });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      await API.post("/auth/register", form);
      alert(t("registerSuccess"));
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || t("registrationFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card glass-card">
        <div className="auth-panel" style={styles.hero}>
          <div className="pill">{t("registerPill")}</div>
          <h1 className="headline" style={{ marginTop: 18 }}>{t("registerHeadline")}</h1>
          <p className="subtle" style={styles.copy}>{t("registerCopy")}</p>

          <select
            className="field"
            value={form.preferredLanguage}
            onChange={(e) => {
              setLanguagePreference(e.target.value, false);
              setForm((current) => ({ ...current, preferredLanguage: e.target.value }));
            }}
          >
            {supportedLanguages.map((option) => (
              <option key={option.code} value={option.code}>{option.label}</option>
            ))}
          </select>

          <button className="button-secondary" onClick={toggleTheme} style={{ width: "fit-content" }}>
            {theme === "light" ? t("darkMode") : t("lightMode")}
          </button>
        </div>

        <div className="auth-panel surface-card" style={styles.formPanel}>
          <div className="pill">{theme === "light" ? t("registerThemeLight") : t("registerThemeDark")}</div>
          <h2 style={{ marginBottom: 8 }}>{t("createAccount")}</h2>
          <p className="subtle" style={{ marginTop: 0 }}>{t("registerPanelCopy")}</p>

          <div className="auth-form">
            <input className="field" name="name" placeholder={t("name")} onChange={handleChange} />
            <input className="field" name="email" placeholder={t("email")} onChange={handleChange} />
            <input className="field" name="password" type="password" placeholder={t("password")} onChange={handleChange} />
            <button className="button-primary" onClick={handleRegister} disabled={loading}>
              {loading ? "..." : t("registerCta")}
            </button>
            <button className="button-secondary" onClick={() => navigate("/")}>
              {t("backToLogin")}
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
