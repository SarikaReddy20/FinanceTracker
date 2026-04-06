import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

function Settings() {
  const { language, setLanguagePreference, supportedLanguages, t, loading } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  const saveLanguage = async () => {
    await setLanguagePreference(selectedLanguage, true);
    setStatus(t("languageSaved"));
  };

  return (
    <Layout>
      <section className="glass-card hero-card">
        <div className="pill">{t("navSettings")}</div>
        <h1 className="headline" style={{ marginTop: 16 }}>{t("settingsTitle")}</h1>
        <p className="subtle" style={{ maxWidth: 720, lineHeight: 1.7 }}>
          {t("settingsSubtitle")}
        </p>
      </section>

      <section className="surface-card report-card" style={{ maxWidth: 640 }}>
        <label className="subtle" htmlFor="language-select">{t("languageLabel")}</label>
        <select
          id="language-select"
          className="field"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          style={{ marginTop: 12 }}
        >
          {supportedLanguages.map((option) => (
            <option key={option.code} value={option.code}>{option.label}</option>
          ))}
        </select>

        <button className="button-primary" style={{ marginTop: 16 }} onClick={saveLanguage} disabled={loading}>
          {loading ? t("saving") : t("saveLanguage")}
        </button>

        {status ? <p className="subtle" style={{ marginBottom: 0 }}>{status}</p> : null}
      </section>

      <section className="surface-card report-card" style={{ maxWidth: 640 }}>
        <div className="toolbar">
          <div>
            <h3 style={{ margin: 0 }}>Appearance</h3>
            <p className="subtle" style={{ margin: "6px 0 0" }}>
              Switch between light and dark mode any time from here.
            </p>
          </div>

          <button className="button-secondary" onClick={toggleTheme}>
            {theme === "light" ? t("darkMode") : t("lightMode")}
          </button>
        </div>
      </section>
    </Layout>
  );
}

export default Settings;
