import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";

const getDefaultTargetDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 6);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateInput = (value) => {
  if (!value) {
    return getDefaultTargetDate();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return getDefaultTargetDate();
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calculatePreview = ({ targetAmount, currentSaved, targetDate }) => {
  const amount = Number(targetAmount) || 0;
  const saved = Number(currentSaved) || 0;
  const target = targetDate ? new Date(`${targetDate}T00:00:00+05:30`) : null;

  if (!amount || !target || Number.isNaN(target.getTime())) {
    return { remainingAmount: 0, monthsRemaining: 0, monthlyRequired: 0 };
  }

  const today = new Date();
  const monthsRemaining = Math.max(
    (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()) + (target.getDate() > today.getDate() ? 1 : 0),
    1
  );
  const remainingAmount = Math.max(amount - saved, 0);

  return {
    remainingAmount,
    monthsRemaining,
    monthlyRequired: remainingAmount / monthsRemaining,
  };
};

function Goals() {
  const { t } = useLanguage();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    targetAmount: "",
    currentSaved: "",
    targetDate: getDefaultTargetDate(),
    notes: "",
  });

  const preview = useMemo(() => calculatePreview(form), [form]);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        setLoading(true);
        const res = await API.get("/goals");
        setGoals(res.data.goals || []);
      } catch (error) {
        setStatus(error.response?.data?.message || t("goalsLoadFailed"));
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [t]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const resetForm = () => {
    setEditingGoalId(null);
    setForm({
      title: "",
      targetAmount: "",
      currentSaved: "",
      targetDate: getDefaultTargetDate(),
      notes: "",
    });
  };

  const handleEdit = (goal) => {
    setEditingGoalId(goal._id);
    setStatus("");
    setForm({
      title: goal.title || "",
      targetAmount: goal.targetAmount ?? "",
      currentSaved: goal.currentSaved ?? "",
      targetDate: formatDateInput(goal.targetDate),
      notes: goal.notes || "",
    });
  };

  const handleSubmit = async () => {
    const targetAmount = Number(form.targetAmount);
    const currentSaved = Number(form.currentSaved || 0);

    if (Number.isFinite(targetAmount) && Number.isFinite(currentSaved) && currentSaved > targetAmount) {
      setStatus(t("savedGreaterThanTarget"));
      return;
    }

    try {
      setSaving(true);
      setStatus("");
      const res = editingGoalId
        ? await API.put(`/goals/${editingGoalId}`, form)
        : await API.post("/goals", form);

      setGoals((current) => {
        if (editingGoalId) {
          return current
            .map((goal) => (goal._id === editingGoalId ? res.data.goal : goal))
            .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
        }

        return [...current, res.data.goal].sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
      });
      resetForm();
      setStatus(editingGoalId ? t("goalUpdated") : t("goalCreated"));
    } catch (error) {
      setStatus(error.response?.data?.message || (editingGoalId ? t("goalUpdateFailed") : t("goalCreateFailed")));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/goals/${id}`);
      setGoals((current) => current.filter((goal) => goal._id !== id));
      if (editingGoalId === id) {
        resetForm();
      }
    } catch (error) {
      setStatus(error.response?.data?.message || t("goalDeleteFailed"));
    }
  };

  return (
    <Layout>
      <section className="glass-card hero-card">
        <div className="pill">{t("goalsHeroPill")}</div>
        <h1 className="headline" style={{ marginTop: 16 }}>
          {t("goalsHeroTitle")}
        </h1>
        <p className="subtle" style={{ maxWidth: 760, lineHeight: 1.7 }}>
          {t("goalsHeroCopy")}
        </p>
      </section>

      <section className="chart-grid">
        <div className="chart-span-7">
          <div className="surface-card report-card">
            <div className="toolbar">
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 0 }}>
                  {editingGoalId ? t("editGoalPlan") : t("createGoalPlan")}
                </h3>
                <p className="subtle" style={{ margin: "6px 0 0" }}>
                  {editingGoalId
                    ? t("editGoalCopy")
                    : t("createGoalCopy")}
                </p>
              </div>
              {editingGoalId ? (
                <button className="button-secondary" onClick={resetForm}>
                  {t("cancelEdit")}
                </button>
              ) : null}
            </div>
            <div className="auth-form" style={{ marginTop: 18 }}>
              <input className="field" name="title" placeholder={t("goalTitlePlaceholder")} value={form.title} onChange={handleChange} />
              <input className="field" name="targetAmount" placeholder={t("targetAmountPlaceholder")} value={form.targetAmount} onChange={handleChange} />
              <input className="field" name="currentSaved" placeholder={t("currentSavedPlaceholder")} value={form.currentSaved} onChange={handleChange} />
              <input className="field" type="date" name="targetDate" value={form.targetDate} onChange={handleChange} />
              <textarea className="field" name="notes" placeholder={t("notesPlaceholder")} value={form.notes} onChange={handleChange} rows={4} />
              <button className="button-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? t("saving") : editingGoalId ? t("updateGoal") : t("createPlan")}
              </button>
              {status ? <p className="subtle" style={{ marginBottom: 0 }}>{status}</p> : null}
            </div>
          </div>
        </div>

        <div className="chart-span-5">
          <div className="surface-card report-card">
            <h3 style={{ marginTop: 0 }}>{t("plannerPreview")}</h3>
            <div className="metric-grid" style={{ marginTop: 16 }}>
              <div className="metric-card surface-card">
                <div className="subtle">{t("remaining")}</div>
                <p className="metric-value">Rs {preview.remainingAmount.toFixed(2)}</p>
              </div>
              <div className="metric-card surface-card">
                <div className="subtle">{t("monthsLeft")}</div>
                <p className="metric-value">{preview.monthsRemaining}</p>
              </div>
              <div className="metric-card surface-card">
                <div className="subtle">{t("savePerMonth")}</div>
                <p className="metric-value">Rs {preview.monthlyRequired.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card report-card">
        <div className="toolbar">
          <div>
            <h3 style={{ margin: 0 }}>{t("mySavingGoals")}</h3>
            <p className="subtle" style={{ margin: "6px 0 0" }}>
              {t("mySavingGoalsCopy")}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">{t("loadingGoals")}</div>
        ) : goals.length ? (
          <div className="table-list" style={{ marginTop: 18 }}>
            {goals.map((goal) => (
              <div className="table-row goal-row" key={goal._id}>
                <div>
                  <strong>{goal.title}</strong>
                  <div className="subtle">{t("targetBy")}: Rs {goal.targetAmount.toFixed(2)} by {new Date(goal.targetDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}</div>
                  {goal.notes ? <div className="subtle">{goal.notes}</div> : null}
                </div>
                <div>
                  <div className="subtle">{t("saved")}</div>
                  <strong>Rs {goal.currentSaved.toFixed(2)}</strong>
                  <div className="subtle">{goal.progressPercent.toFixed(1)}% {t("complete")}</div>
                </div>
                <div>
                  <div className="subtle">{t("monthlyPlan")}</div>
                  <strong>Rs {goal.monthlyRequired.toFixed(2)}</strong>
                  <div className="subtle">{goal.monthsRemaining} {t("monthsLeftSuffix")}</div>
                </div>
                <div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <button className="button-secondary" onClick={() => handleEdit(goal)}>{t("edit")}</button>
                    <button className="button-secondary" onClick={() => handleDelete(goal._id)}>{t("delete")}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">{t("noGoalsYet")}</div>
        )}
      </section>
    </Layout>
  );
}

export default Goals;
