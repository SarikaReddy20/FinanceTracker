import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { notifyTransactionsUpdated } from "../utils/reportEvents";

function Settings() {
  const { language, setLanguagePreference, supportedLanguages, t, loading, translateDocumentType } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [status, setStatus] = useState("");
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentStatus, setDocumentStatus] = useState("");
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  useEffect(() => () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setDocumentsLoading(true);
        const res = await API.get("/uploaded-documents");
        setDocuments(res.data.documents || []);
      } catch (error) {
        setDocumentStatus(error.response?.data?.message || t("uploadedFilesLoadFailed"));
      } finally {
        setDocumentsLoading(false);
      }
    };

    loadDocuments();
  }, [t]);

  const saveLanguage = async () => {
    await setLanguagePreference(selectedLanguage, true);
    setStatus(t("languageSaved"));
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      setDocumentStatus("");
      await API.delete(`/uploaded-documents/${documentId}`);
      setDocuments((current) => current.filter((document) => document._id !== documentId));
      if (previewDocument?._id === documentId) {
        closePreview();
      }
      setDocumentStatus(t("uploadedFileDeleted"));
      notifyTransactionsUpdated();
    } catch (error) {
      setDocumentStatus(error.response?.data?.message || t("uploadedFileDeleteFailed"));
    }
  };

  const handlePreviewDocument = async (document) => {
    try {
      setDocumentStatus("");
      setPreviewLoading(true);
      const res = await API.get(`/uploaded-documents/${document._id}/content`, {
        responseType: "blob",
      });

      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }

      const nextUrl = window.URL.createObjectURL(new Blob([res.data], { type: document.mimeType }));
      setPreviewUrl(nextUrl);
      setPreviewDocument(document);
    } catch (error) {
      setDocumentStatus(error.response?.data?.message || t("previewUnavailable"));
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setPreviewDocument(null);
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
            <h3 style={{ margin: 0 }}>{t("appearance")}</h3>
            <p className="subtle" style={{ margin: "6px 0 0" }}>
              {t("appearanceCopy")}
            </p>
          </div>

          <button className="button-secondary" onClick={toggleTheme}>
            {theme === "light" ? t("darkMode") : t("lightMode")}
          </button>
        </div>
      </section>

      <section className="surface-card report-card">
        <div className="toolbar">
          <div>
            <h3 style={{ margin: 0 }}>{t("uploadedFilesTitle")}</h3>
            <p className="subtle" style={{ margin: "6px 0 0" }}>
              {t("uploadedFilesCopy")}
            </p>
          </div>
        </div>

        {documentStatus ? <p className="subtle" style={{ marginBottom: 0 }}>{documentStatus}</p> : null}

        {documentsLoading ? (
          <div className="empty-state">{t("loadingUploadedFiles")}</div>
        ) : documents.length ? (
          <div className="table-list" style={{ marginTop: 18 }}>
            {documents.map((document) => (
              <div className="table-row" key={document._id}>
                <div>
                  <strong>{document.originalName}</strong>
                  <div className="subtle">
                    {translateDocumentType(document.documentType)} - {new Date(document.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </div>
                </div>
                <div className="subtle">
                  {(document.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button className="button-secondary" onClick={() => handlePreviewDocument(document)}>
                    {t("view")}
                  </button>
                  <button className="button-secondary" onClick={() => handleDeleteDocument(document._id)}>
                    {t("delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">{t("noUploadedFiles")}</div>
        )}
      </section>

      {previewLoading ? (
        <section className="surface-card report-card">
          <h3 style={{ marginTop: 0 }}>{t("previewTitle")}</h3>
          <p className="subtle">{t("previewLoading")}</p>
        </section>
      ) : null}

      {previewDocument && previewUrl ? (
        <section className="surface-card report-card">
          <div className="toolbar">
            <div>
              <h3 style={{ margin: 0 }}>{t("previewTitle")}</h3>
              <p className="subtle" style={{ margin: "6px 0 0" }}>{previewDocument.originalName}</p>
            </div>
            <button className="button-secondary" onClick={closePreview}>
              {t("closePreview")}
            </button>
          </div>

          {previewDocument.mimeType === "application/pdf" ? (
            <iframe className="document-preview-frame" src={previewUrl} title={previewDocument.originalName} />
          ) : (
            <img className="document-preview-image" src={previewUrl} alt={previewDocument.originalName} />
          )}
        </section>
      ) : null}
    </Layout>
  );
}

export default Settings;
