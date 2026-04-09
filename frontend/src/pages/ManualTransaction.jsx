import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import { notifyTransactionsUpdated } from "../utils/reportEvents";
import { useLanguage } from "../context/LanguageContext";

const CATEGORY_OPTIONS = [
  "Food",
  "Groceries",
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

const INITIAL_VISIBLE_COUNT = 5;

const toInputDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toInputTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

function ManualTransaction() {
  const { t, translateCategory } = useLanguage();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [manualTransactions, setManualTransactions] = useState([]);
  const [manualLoading, setManualLoading] = useState(true);
  const [showAllManual, setShowAllManual] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState("");
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    type: "DEBIT",
    date: "",
    time: "",
    category: "",
  });

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const fetchAllManual = async () => {
    let page = 1;
    const all = [];
    while (true) {
      const res = await API.get("/transactions/manual", { params: { page, limit: 100 } });
      all.push(...(res.data.transactions || []));
      if (!res.data.hasMore) {
        break;
      }
      page += 1;
    }
    setManualTransactions(all);
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setManualLoading(true);
        await fetchAllManual();
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || t("manualLoadFailed"));
        }
      } finally {
        if (isMounted) {
          setManualLoading(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [t]);

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

      if (form.date) payload.date = form.date;
      if (form.time) payload.time = form.time;
      if (form.category) payload.category = form.category;

      const res = await API.post("/transactions/manual", payload);
      setResult(res.data);
      setForm(INITIAL_FORM);
      await fetchAllManual();
      notifyTransactionsUpdated();
    } catch (err) {
      setError(err.response?.data?.message || t("addTransactionFailed"));
    } finally {
      setLoading(false);
    }
  };

  const beginEdit = (transaction) => {
    setEditingTransactionId(transaction._id);
    setEditForm({
      description: transaction.description || "",
      amount: String(transaction.amount ?? ""),
      type: transaction.type || "DEBIT",
      date: toInputDate(transaction.date),
      time: toInputTime(transaction.date),
      category: transaction.category || "Uncategorized",
    });
  };

  const cancelEdit = () => {
    setEditingTransactionId("");
    setEditForm({
      description: "",
      amount: "",
      type: "DEBIT",
      date: "",
      time: "",
      category: "",
    });
  };

  const saveManualEdit = async () => {
    try {
      const payload = {
        description: editForm.description,
        amount: Number(editForm.amount),
        type: editForm.type,
        date: editForm.date,
        time: editForm.time,
        category: editForm.category,
      };
      const res = await API.put(`/transactions/manual/${editingTransactionId}`, payload);
      setManualTransactions((current) => current.map((item) => (
        item._id === editingTransactionId ? res.data.transaction : item
      )));
      cancelEdit();
      notifyTransactionsUpdated();
    } catch (err) {
      setError(err.response?.data?.message || t("manualUpdateFailed"));
    }
  };

  const visibleManual = useMemo(
    () => (showAllManual ? manualTransactions : manualTransactions.slice(0, INITIAL_VISIBLE_COUNT)),
    [manualTransactions, showAllManual],
  );

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
            <select className="field" value={form.type} onChange={(event) => updateField("type", event.target.value)}>
              <option value="DEBIT">{t("debit")}</option>
              <option value="CREDIT">{t("credit")}</option>
            </select>
          </label>
          <label className="manual-field">
            <span>{t("dateLabel")}</span>
            <input className="field" type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} />
          </label>
          <label className="manual-field">
            <span>{t("timeLabel")}</span>
            <input className="field" type="time" value={form.time} onChange={(event) => updateField("time", event.target.value)} />
          </label>
          <label className="manual-field">
            <span>{t("categoryLabel")}</span>
            <select className="field" value={form.category} onChange={(event) => updateField("category", event.target.value)}>
              <option value="">{t("autoDetect")}</option>
              {CATEGORY_OPTIONS.map((category) => (
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
            <div className="detail-item"><span className="subtle">{t("descriptionLabel")}</span><strong>{transaction.description}</strong></div>
            <div className="detail-item"><span className="subtle">{t("amountLabel")}</span><strong>Rs {transaction.amount}</strong></div>
            <div className="detail-item"><span className="subtle">{t("typeLabel")}</span><strong>{transaction.type === "DEBIT" ? t("debit") : t("credit")}</strong></div>
            <div className="detail-item"><span className="subtle">{t("categoryLabel")}</span><strong>{translateCategory(transaction.category)}</strong></div>
            <div className="detail-item"><span className="subtle">{t("dateLabel")}</span><strong>{transaction.displayDate}</strong></div>
            <div className="detail-item"><span className="subtle">{t("timeLabel")}</span><strong>{transaction.displayTime}</strong></div>
          </div>
        </section>
      ) : null}

      <section className="surface-card report-card">
        <div className="toolbar">
          <div>
            <h3 style={{ margin: 0 }}>{t("manualEditTitle")}</h3>
            <p className="subtle" style={{ margin: "6px 0 0" }}>{t("manualEditCopy")}</p>
          </div>
          {manualTransactions.length > INITIAL_VISIBLE_COUNT ? (
            <button className="button-secondary" onClick={() => setShowAllManual((current) => !current)}>
              {showAllManual ? t("showLess") : t("viewMore")}
            </button>
          ) : null}
        </div>

        {manualLoading ? (
          <div className="empty-state">{t("loading")}</div>
        ) : visibleManual.length ? (
          <div className="table-list" style={{ marginTop: 16 }}>
            {visibleManual.map((manual) => (
              <div className="table-row" key={manual._id}>
                <div>
                  <strong>{manual.description}</strong>
                  <div className="subtle">{translateCategory(manual.category)} - {manual.type}</div>
                </div>
                <div className="subtle">
                  {manual.displayDate}
                  <div>{manual.displayTime}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button className="button-secondary" onClick={() => beginEdit(manual)}>{t("edit")}</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">{t("noManualTransactions")}</div>
        )}
      </section>

      {editingTransactionId ? (
        <section className="surface-card report-card">
          <h3 style={{ marginTop: 0 }}>{t("editManualEntry")}</h3>
          <div className="manual-form" style={{ marginTop: 14 }}>
            <label className="manual-field">
              <span>{t("descriptionLabel")}</span>
              <input className="field" value={editForm.description} onChange={(e) => setEditForm((current) => ({ ...current, description: e.target.value }))} />
            </label>
            <label className="manual-field">
              <span>{t("amountLabel")}</span>
              <input className="field" type="number" value={editForm.amount} onChange={(e) => setEditForm((current) => ({ ...current, amount: e.target.value }))} />
            </label>
            <label className="manual-field">
              <span>{t("typeLabel")}</span>
              <select className="field" value={editForm.type} onChange={(e) => setEditForm((current) => ({ ...current, type: e.target.value }))}>
                <option value="DEBIT">{t("debit")}</option>
                <option value="CREDIT">{t("credit")}</option>
              </select>
            </label>
            <label className="manual-field">
              <span>{t("dateLabel")}</span>
              <input className="field" type="date" value={editForm.date} onChange={(e) => setEditForm((current) => ({ ...current, date: e.target.value }))} />
            </label>
            <label className="manual-field">
              <span>{t("timeLabel")}</span>
              <input className="field" type="time" value={editForm.time} onChange={(e) => setEditForm((current) => ({ ...current, time: e.target.value }))} />
            </label>
            <label className="manual-field">
              <span>{t("categoryLabel")}</span>
              <select className="field" value={editForm.category} onChange={(e) => setEditForm((current) => ({ ...current, category: e.target.value }))}>
                {CATEGORY_OPTIONS.map((category) => (
                  <option value={category} key={category}>{translateCategory(category)}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="toolbar" style={{ marginTop: 14 }}>
            <button className="button-primary" onClick={saveManualEdit}>{t("saveChanges")}</button>
            <button className="button-secondary" onClick={cancelEdit}>{t("cancelEdit")}</button>
          </div>
        </section>
      ) : null}
    </Layout>
  );
}

export default ManualTransaction;
