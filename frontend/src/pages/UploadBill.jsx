import { useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import { notifyTransactionsUpdated } from "../utils/reportEvents";
import { useLanguage } from "../context/LanguageContext";

const toDatetimeLocalValue = (value) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

function UploadBill() {
  const { t, translateCategory, translateDocumentType } = useLanguage();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [reviewForm, setReviewForm] = useState({
    description: "",
    amount: "",
    date: "",
    category: "",
    type: "DEBIT",
  });

  const uploadWithOverrides = async (overrides = null) => {
    if (!file) {
      setError(t("selectBillFirst"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    if (overrides) {
      if (overrides.description?.trim()) {
        formData.append("description", overrides.description.trim());
      }
      if (overrides.amount !== "" && overrides.amount !== null && overrides.amount !== undefined) {
        formData.append("amount", String(overrides.amount));
      }
      if (overrides.date) {
        formData.append("date", overrides.date);
      }
      if (overrides.type) {
        formData.append("type", overrides.type);
      }
      if (overrides.category?.trim()) {
        formData.append("category", overrides.category.trim());
      }
    }

    const res = await API.post("/transactions/upload-bill", formData);
    setResult(res.data);

    if (res.data.needsReview && res.data.extracted) {
      setReviewForm({
        description: res.data.extracted.description || "",
        amount: res.data.extracted.amount ?? "",
        date: toDatetimeLocalValue(res.data.extracted.date),
        category: res.data.extracted.category || "",
        type: res.data.extracted.type || "DEBIT",
      });
    }

    if (res.data.transaction) {
      notifyTransactionsUpdated();
    }
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);
      await uploadWithOverrides();
    } catch (err) {
      setError(err.response?.data?.message || t("billUploadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      await uploadWithOverrides({
        ...reviewForm,
        amount: reviewForm.amount === "" ? "" : Number(reviewForm.amount),
      });
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
                    {t("date")}: {Math.round((extracted.fieldConfidence.date || 0) * 100)}%,{" "}
                    {t("typeLabel")}: {Math.round((extracted.fieldConfidence.type || 0) * 100)}%
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

          {result.needsReview ? (
            <div className="surface-card report-card" style={{ marginTop: 18 }}>
              <h4>Review & Confirm</h4>
              <div className="detail-grid">
                <label className="detail-item">
                  <span className="subtle">{t("description")}</span>
                  <input
                    type="text"
                    value={reviewForm.description}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </label>
                <label className="detail-item">
                  <span className="subtle">{t("amount")}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={reviewForm.amount}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, amount: e.target.value }))}
                  />
                </label>
                <label className="detail-item">
                  <span className="subtle">{t("date")}</span>
                  <input
                    type="datetime-local"
                    value={reviewForm.date}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </label>
                <label className="detail-item">
                  <span className="subtle">{t("category")}</span>
                  <input
                    type="text"
                    value={reviewForm.category}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, category: e.target.value }))}
                  />
                </label>
                <label className="detail-item">
                  <span className="subtle">{t("typeLabel")}</span>
                  <select
                    value={reviewForm.type}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="DEBIT">{t("debit")}</option>
                    <option value="CREDIT">{t("credit")}</option>
                  </select>
                </label>
              </div>
              <button className="button-primary" onClick={handleReviewSubmit} disabled={loading} style={{ marginTop: 12 }}>
                {loading ? "..." : "Confirm & Save"}
              </button>
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
