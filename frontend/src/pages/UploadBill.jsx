import { useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import { notifyTransactionsUpdated } from "../utils/reportEvents";

function UploadBill() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Select a bill image first.");
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
      setError(err.response?.data?.message || "Bill upload failed");
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
            <div className="pill">Bill OCR</div>
            <h1 className="headline" style={{ marginTop: 16 }}>
              Scan receipts and turn messy bill images into useful transaction data.
            </h1>
            <p className="subtle" style={{ maxWidth: 720, lineHeight: 1.7 }}>
              Upload a receipt image to extract description, amount, date, time, and field confidence before it lands in your reports.
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
                <strong>{file ? file.name : "Choose a bill image"}</strong>
                <div className="subtle">JPG, PNG, and WEBP images work best.</div>
              </div>
            </label>

            <button className="button-primary" onClick={handleUpload} disabled={loading}>
              {loading ? "Processing..." : "Upload Bill"}
            </button>

            {error ? <div className="status-banner status-error">{error}</div> : null}
          </div>
        </div>
      </section>

      {result ? (
        <section className="surface-card report-card">
          <h3>{result.needsReview ? "Needs Review" : "Processed Successfully"}</h3>
          <p className="subtle">{result.message}</p>

          {transaction ? (
            <div className="detail-grid">
              <div className="detail-item">
                <span className="subtle">Description</span>
                <strong>{transaction.description}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">Amount</span>
                <strong>Rs {transaction.amount}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">Category</span>
                <strong>{transaction.category}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">Date</span>
                <strong>{transaction.displayDate}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">Time</span>
                <strong>{transaction.displayTime}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">Source</span>
                <strong>{transaction.source}</strong>
              </div>
            </div>
          ) : null}

          {extracted ? (
            <div className="detail-grid" style={{ marginTop: 18 }}>
              <div className="detail-item">
                <span className="subtle">Extracted Description</span>
                <strong>{extracted.description || "-"}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">Extracted Amount</span>
                <strong>{extracted.amount ?? "-"}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">Extracted Date</span>
                <strong>{extracted.date || "-"}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">Type</span>
                <strong>{extracted.type || "-"}</strong>
              </div>
              <div className="detail-item">
                <span className="subtle">Category</span>
                <strong>{extracted.category || "-"}</strong>
              </div>
              {extracted.fieldConfidence ? (
                <div className="detail-item">
                  <span className="subtle">Confidence</span>
                  <strong>
                    Description {Math.round((extracted.fieldConfidence.description || 0) * 100)}%,
                    Amount {Math.round((extracted.fieldConfidence.amount || 0) * 100)}%,
                    Date {Math.round((extracted.fieldConfidence.date || 0) * 100)}%
                  </strong>
                </div>
              ) : null}
            </div>
          ) : null}

          {result.missingFields?.length ? (
            <div className="status-banner status-warning" style={{ marginTop: 18 }}>
              <strong>Missing fields:</strong> {result.missingFields.join(", ")}
            </div>
          ) : null}

          {result.lowConfidenceFields?.length ? (
            <div className="status-banner status-warning" style={{ marginTop: 12 }}>
              <strong>Low confidence fields:</strong> {result.lowConfidenceFields.join(", ")}
            </div>
          ) : null}

          {extracted?.descriptionCandidates?.length ? (
            <div className="surface-card report-card" style={{ marginTop: 18 }}>
              <h4>Description Candidates</h4>
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
              <h4>Amount Candidates</h4>
              <ul>
                {extracted.amountCandidates.map((candidate) => (
                  <li key={`${candidate.label}-${candidate.value}-${candidate.confidence}`}>
                    {candidate.value} from {candidate.label} ({Math.round(candidate.confidence * 100)}%)
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.rawText ? (
            <div className="surface-card report-card" style={{ marginTop: 18 }}>
              <h4>OCR Text</h4>
              <pre className="ocr-pre">{result.rawText}</pre>
            </div>
          ) : null}
        </section>
      ) : null}
    </Layout>
  );
}

export default UploadBill;
