import { useState } from "react";
import API from "../services/api";
import UncategorizedTable from "../components/UncategorizedTable";
import Layout from "../components/Layout";
import { notifyTransactionsUpdated } from "../utils/reportEvents";
import { useLanguage } from "../context/LanguageContext";

function UploadPDF() {
  const { t } = useLanguage();
  const [file, setFile] = useState(null);
  const [uncategorized, setUncategorized] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      setError(t("selectPdfFirst"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      setSummary(null);

      const res = await API.post("/transactions/upload-pdf", formData);

      setUncategorized(res.data.uncategorized || []);
      setSummary(res.data);
      notifyTransactionsUpdated();
    } catch (err) {
      setError(err.response?.data?.message || t("uploadFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="glass-card hero-card">
        <div className="toolbar">
          <div>
            <div className="pill">{t("statementImport")}</div>
            <h1 className="headline" style={{ marginTop: 16 }}>
              {t("uploadPdfHero")}
            </h1>
            <p className="subtle" style={{ maxWidth: 720, lineHeight: 1.7 }}>
              {t("uploadPdfCopy")}
            </p>
          </div>

          <div className="surface-card upload-panel">
            <label className="upload-dropzone">
              <input
                className="sr-only"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
              <div className="upload-icon">PDF</div>
              <div>
                <strong>{file ? file.name : t("choosePdf")}</strong>
                <div className="subtle">{t("onlyPdfAccepted")}</div>
              </div>
            </label>

            <button className="button-primary" onClick={handleUpload} disabled={loading}>
              {loading ? "..." : t("uploadStatement")}
            </button>

            {error ? <div className="status-banner status-error">{error}</div> : null}
          </div>
        </div>
      </section>

      {summary ? (
        <section className="metric-grid">
          <div className="surface-card metric-card">
            <div className="subtle">{t("imported")}</div>
            <p className="metric-value">{summary.totalAdded ?? 0}</p>
          </div>
          <div className="surface-card metric-card">
            <div className="subtle">{t("duplicatesSkipped")}</div>
            <p className="metric-value">{summary.duplicatesCount ?? 0}</p>
          </div>
          <div className="surface-card metric-card">
            <div className="subtle">{t("needReview")}</div>
            <p className="metric-value">{uncategorized.length}</p>
          </div>
        </section>
      ) : null}

      <section className="surface-card report-card">
        <div className="toolbar">
          <div>
            <h3 style={{ margin: 0 }}>{t("categoryReview")}</h3>
            <p className="subtle" style={{ margin: "6px 0 0" }}>
              {t("categoryReviewCopy")}
            </p>
          </div>
        </div>

        <UncategorizedTable
          data={uncategorized}
          onUpdated={(id) => {
            setUncategorized((current) => current.filter((item) => item._id !== id));
          }}
        />
      </section>
    </Layout>
  );
}

export default UploadPDF;
