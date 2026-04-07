import { useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import { notifyTransactionsUpdated } from "../utils/reportEvents";
import { useLanguage } from "../context/LanguageContext";

function UploadBill() {
  const { t, translateCategory, translateDocumentType } = useLanguage();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError(t("selectBillFirst"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await API.post("/transactions/upload-bill", formData);
      setResult(res.data);

      if (res.data.transaction) {
        notifyTransactionsUpdated();
      }
    } catch (err) {
      setError(err.response?.data?.message || t("billUploadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const transaction = result?.transaction;
  const extracted = result?.extracted;

  return (
    <Layout>
      <section className="glass-card hero-card">
        <div className="toolbar">
          <div>
            <div className="pill">{t("billOcrPill")}</div>
            <h1 className="headline" style={{ marginTop: 16 }}>
              {t("uploadBillHero")}
            </h1>
            <p className="subtle" style={{ maxWidth: 720, lineHeight: 1.7 }}>
              {t("uploadBillCopy")}
            </p>
          </div>

          <div className="surface-card upload-panel">
            <label className="upload-dropzone">
              <input
                className="sr-only"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/*"
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
              <div className="upload-icon">OCR</div>
              <div>
                <strong>{file ? file.name : t("chooseBill")}</strong>
                <div className="subtle">{t("imageFormatsHelp")}</div>
              </div>
            </label>

            <button className="button-primary" onClick={handleUpload} disabled={loading}>
              {loading ? "..." : t("uploadBill")}
            </button>

            {error ? <div className="status-banner status-error">{error}</div> : null}
          </div>
        </div>
      </section>

      {result ? (
        <section className="surface-card report-card">
          <h3>{result.needsReview ? t("needsReview") : t("processedSuccessfully")}</h3>
          <p className="subtle">{result.message}</p>

          {transaction ? (
            <div className="detail-grid">
              <div className="detail-item">
                <span className="subtle">{t("description")}</span>
                <strong>{transaction.description}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">{t("amount")}</span>
                <strong>Rs {transaction.amount}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">{t("category")}</span>
                <strong>{translateCategory(transaction.category)}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">{t("date")}</span>
                <strong>{transaction.displayDate}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">{t("time")}</span>
                <strong>{transaction.displayTime}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">{t("source")}</span>
                <strong>{translateDocumentType(transaction.source)}</strong>
              </div>
            </div>
          ) : null}

          {extracted ? (
            <div className="detail-grid" style={{ marginTop: 18 }}>
              <div className="detail-item">
                <span className="subtle">{t("description")}</span>
                <strong>{extracted.description || "-"}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">{t("amount")}</span>
                <strong>{extracted.amount ?? "-"}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">{t("date")}</span>
                <strong>{extracted.date || "-"}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">{t("typeLabel")}</span>
                <strong>{extracted.type ? t(extracted.type === "DEBIT" ? "debit" : "credit") : "-"}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">{t("category")}</span>
                <strong>{extracted.category ? translateCategory(extracted.category) : "-"}</strong>
              </div>
              {extracted.fieldConfidence ? (
                <div className="detail-item">
                  <span className="subtle">{t("confidence")}</span>
                  <strong>
                    {t("description")}: {Math.round((extracted.fieldConfidence.description || 0) * 100)}%,{" "}
                    {t("amount")}: {Math.round((extracted.fieldConfidence.amount || 0) * 100)}%,{" "}
                    {t("date")}: {Math.round((extracted.fieldConfidence.date || 0) * 100)}%
                  </strong>
                </div>
              ) : null}
            </div>
          ) : null}

          {result.missingFields?.length ? (
            <div className="status-banner status-warning" style={{ marginTop: 18 }}>
              <strong>{t("missingFields")}:</strong> {result.missingFields.join(", ")}
            </div>
          ) : null}

          {result.lowConfidenceFields?.length ? (
            <div className="status-banner status-warning" style={{ marginTop: 12 }}>
              <strong>{t("lowConfidenceFields")}:</strong> {result.lowConfidenceFields.join(", ")}
            </div>
          ) : null}

          {extracted?.descriptionCandidates?.length ? (
            <div className="surface-card report-card" style={{ marginTop: 18 }}>
              <h4>{t("descriptionCandidates")}</h4>
              <ul>
                {extracted.descriptionCandidates.map((candidate) => (
                  <li key={`${candidate.value}-${candidate.confidence}`}>
                    {candidate.value} ({Math.round(candidate.confidence * 100)}%)
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {extracted?.amountCandidates?.length ? (
            <div className="surface-card report-card" style={{ marginTop: 18 }}>
              <h4>{t("amountCandidates")}</h4>
              <ul>
                {extracted.amountCandidates.map((candidate) => (
                  <li key={`${candidate.label}-${candidate.value}-${candidate.confidence}`}>
                    {candidate.value} ({candidate.label}, {Math.round(candidate.confidence * 100)}%)
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.rawText ? (
            <div className="surface-card report-card" style={{ marginTop: 18 }}>
              <h4>{t("ocrText")}</h4>
              <pre className="ocr-pre">{result.rawText}</pre>
            </div>
          ) : null}
        </section>
      ) : null}
    </Layout>
  );
}

export default UploadBill;
