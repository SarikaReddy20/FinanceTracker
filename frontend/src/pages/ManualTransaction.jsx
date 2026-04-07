import { useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import { notifyTransactionsUpdated } from "../utils/reportEvents";
import { useLanguage } from "../context/LanguageContext";

const CATEGORY_OPTIONS = [
  "",
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Entertainment",
  "Education",
  "Health",
  "Reimbursable",
  "Income",
  "Uncategorized",
];

const INITIAL_FORM = {
  description: "",
  amount: "",
  type: "DEBIT",
  date: "",
  time: "",
  category: "",
};

function ManualTransaction() {
  const { t, translateCategory } = useLanguage();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.description.trim()) {
      setError(t("descriptionRequired"));
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError(t("validAmountRequired"));
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const payload = {
        description: form.description.trim(),
        amount: Number(form.amount),
        type: form.type,
      };

      if (form.date) {
        payload.date = form.date;
      }

      if (form.time) {
        payload.time = form.time;
      }

      if (form.category) {
        payload.category = form.category;
      }

      const res = await API.post("/transactions/manual", payload);
      setResult(res.data);
      setForm(INITIAL_FORM);
      notifyTransactionsUpdated();
    } catch (err) {
      setError(err.response?.data?.message || t("addTransactionFailed"));
    } finally {
      setLoading(false);
    }
  };

  const transaction = result?.transaction;

  return (
    <Layout>
      <section className="glass-card hero-card">
        <div className="toolbar">
          <div>
            <div className="pill">{t("manualEntryPill")}</div>
            <h1 className="headline" style={{ marginTop: 16 }}>
              {t("manualEntryHero")}
            </h1>
            <p className="subtle" style={{ maxWidth: 720, lineHeight: 1.7 }}>
              {t("manualEntryCopy")}
            </p>
          </div>
        </div>
      </section>

      <section className="surface-card report-card">
        <form className="manual-form" onSubmit={handleSubmit}>
          <label className="manual-field">
            <span>{t("descriptionLabel")}</span>
            <input
              className="field"
              type="text"
              placeholder={t("descriptionPlaceholder")}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </label>

          <label className="manual-field">
            <span>{t("amountLabel")}</span>
            <input
              className="field"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(event) => updateField("amount", event.target.value)}
            />
          </label>

          <label className="manual-field">
            <span>{t("typeLabel")}</span>
            <select
              className="field"
              value={form.type}
              onChange={(event) => updateField("type", event.target.value)}
            >
              <option value="DEBIT">{t("debit")}</option>
              <option value="CREDIT">{t("credit")}</option>
            </select>
          </label>

          <label className="manual-field">
            <span>{t("dateLabel")}</span>
            <input
              className="field"
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
            />
          </label>

          <label className="manual-field">
            <span>{t("timeLabel")}</span>
            <input
              className="field"
              type="time"
              value={form.time}
              onChange={(event) => updateField("time", event.target.value)}
            />
          </label>

          <label className="manual-field">
            <span>{t("categoryLabel")}</span>
            <select
              className="field"
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
            >
              <option value="">{t("autoDetect")}</option>
              {CATEGORY_OPTIONS.filter(Boolean).map((category) => (
                <option key={category} value={category}>
                  {translateCategory(category)}
                </option>
              ))}
            </select>
          </label>

          <div className="manual-actions">
            <button className="button-primary" type="submit" disabled={loading}>
              {loading ? t("saving") : t("addTransaction")}
            </button>
          </div>
        </form>

        {error ? <div className="status-banner status-error" style={{ marginTop: 18 }}>{error}</div> : null}
      </section>

      {transaction ? (
        <section className="surface-card report-card">
          <h3 style={{ marginTop: 0 }}>{t("transactionAdded")}</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="subtle">{t("descriptionLabel")}</span>
              <strong>{transaction.description}</strong>
            </div>
            <div className="detail-item">
              <span className="subtle">{t("amountLabel")}</span>
              <strong>Rs {transaction.amount}</strong>
            </div>
            <div className="detail-item">
              <span className="subtle">{t("typeLabel")}</span>
              <strong>{transaction.type === "DEBIT" ? t("debit") : t("credit")}</strong>
            </div>
            <div className="detail-item">
              <span className="subtle">{t("categoryLabel")}</span>
              <strong>{translateCategory(transaction.category)}</strong>
            </div>
            <div className="detail-item">
              <span className="subtle">{t("dateLabel")}</span>
              <strong>{transaction.displayDate}</strong>
            </div>
            <div className="detail-item">
              <span className="subtle">{t("timeLabel")}</span>
              <strong>{transaction.displayTime}</strong>
            </div>
          </div>
        </section>
      ) : null}
    </Layout>
  );
}

export default ManualTransaction;
