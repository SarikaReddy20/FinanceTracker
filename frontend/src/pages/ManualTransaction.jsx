import { useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import { notifyTransactionsUpdated } from "../utils/reportEvents";

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
      setError("Description is required.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Enter a valid amount.");
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
      setError(err.response?.data?.message || "Unable to add transaction.");
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
            <div className="pill">Manual Entry</div>
            <h1 className="headline" style={{ marginTop: 16 }}>
              Add a transaction yourself whenever you need a quick correction or cash record.
            </h1>
            <p className="subtle" style={{ maxWidth: 720, lineHeight: 1.7 }}>
              Enter the transaction details below. If you leave the date or time empty, SpendSmart will use the
              current system date and time automatically.
            </p>
          </div>
        </div>
      </section>

      <section className="surface-card report-card">
        <form className="manual-form" onSubmit={handleSubmit}>
          <label className="manual-field">
            <span>Description</span>
            <input
              className="field"
              type="text"
              placeholder="Paid to bakery, salary credited, cash purchase..."
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </label>

          <label className="manual-field">
            <span>Amount</span>
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
            <span>Type</span>
            <select
              className="field"
              value={form.type}
              onChange={(event) => updateField("type", event.target.value)}
            >
              <option value="DEBIT">Debit</option>
              <option value="CREDIT">Credit</option>
            </select>
          </label>

          <label className="manual-field">
            <span>Date</span>
            <input
              className="field"
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
            />
          </label>

          <label className="manual-field">
            <span>Time</span>
            <input
              className="field"
              type="time"
              value={form.time}
              onChange={(event) => updateField("time", event.target.value)}
            />
          </label>

          <label className="manual-field">
            <span>Category</span>
            <select
              className="field"
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
            >
              <option value="">Auto-detect</option>
              {CATEGORY_OPTIONS.filter(Boolean).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <div className="manual-actions">
            <button className="button-primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Add Transaction"}
            </button>
          </div>
        </form>

        {error ? <div className="status-banner status-error" style={{ marginTop: 18 }}>{error}</div> : null}
      </section>

      {transaction ? (
        <section className="surface-card report-card">
          <h3 style={{ marginTop: 0 }}>Transaction added successfully</h3>
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
              <span className="subtle">Type</span>
              <strong>{transaction.type}</strong>
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
          </div>
        </section>
      ) : null}
    </Layout>
  );
}

export default ManualTransaction;
