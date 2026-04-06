import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

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

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await API.get("/goals");
      setGoals(res.data.goals || []);
    } catch (error) {
      setStatus(error.response?.data?.message || "Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

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
      setStatus("Already saved amount cannot be greater than the target amount.");
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
      setStatus(editingGoalId ? "Goal updated successfully." : "Goal plan created successfully.");
    } catch (error) {
      setStatus(error.response?.data?.message || (editingGoalId ? "Failed to update goal" : "Failed to create goal"));
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
      setStatus(error.response?.data?.message || "Failed to delete goal");
    }
  };

  return (
    <Layout>
      <section className="glass-card hero-card">
        <div className="pill">Goal-Based Saving Planner</div>
        <h1 className="headline" style={{ marginTop: 16 }}>
          Turn future purchases into a clear monthly saving plan.
        </h1>
        <p className="subtle" style={{ maxWidth: 760, lineHeight: 1.7 }}>
          Add a goal like laptop, bike, travel, or emergency fund. SpendSmart calculates how much you need to save every month based on your target amount, what you already saved, and your deadline.
        </p>
      </section>

      <section className="chart-grid">
        <div className="chart-span-7">
          <div className="surface-card report-card">
            <div className="toolbar">
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 0 }}>
                  {editingGoalId ? "Edit Goal Plan" : "Create Goal Plan"}
                </h3>
                <p className="subtle" style={{ margin: "6px 0 0" }}>
                  {editingGoalId
                    ? "Update the saved amount or target details whenever you make progress."
                    : "Set a target amount, deadline, and how much you already saved."}
                </p>
              </div>
              {editingGoalId ? (
                <button className="button-secondary" onClick={resetForm}>
                  Cancel Edit
                </button>
              ) : null}
            </div>
            <div className="auth-form" style={{ marginTop: 18 }}>
              <input className="field" name="title" placeholder="Goal title" value={form.title} onChange={handleChange} />
              <input className="field" name="targetAmount" placeholder="Target amount" value={form.targetAmount} onChange={handleChange} />
              <input className="field" name="currentSaved" placeholder="Already saved" value={form.currentSaved} onChange={handleChange} />
              <input className="field" type="date" name="targetDate" value={form.targetDate} onChange={handleChange} />
              <textarea className="field" name="notes" placeholder="Notes (optional)" value={form.notes} onChange={handleChange} rows={4} />
              <button className="button-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : editingGoalId ? "Update Goal" : "Create Plan"}
              </button>
              {status ? <p className="subtle" style={{ marginBottom: 0 }}>{status}</p> : null}
            </div>
          </div>
        </div>

        <div className="chart-span-5">
          <div className="surface-card report-card">
            <h3 style={{ marginTop: 0 }}>Planner Preview</h3>
            <div className="metric-grid" style={{ marginTop: 16 }}>
              <div className="metric-card surface-card">
                <div className="subtle">Remaining</div>
                <p className="metric-value">Rs {preview.remainingAmount.toFixed(2)}</p>
              </div>
              <div className="metric-card surface-card">
                <div className="subtle">Months Left</div>
                <p className="metric-value">{preview.monthsRemaining}</p>
              </div>
              <div className="metric-card surface-card">
                <div className="subtle">Save Per Month</div>
                <p className="metric-value">Rs {preview.monthlyRequired.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card report-card">
        <div className="toolbar">
          <div>
            <h3 style={{ margin: 0 }}>My Saving Goals</h3>
            <p className="subtle" style={{ margin: "6px 0 0" }}>
              Track your targets and see how much you need to save each month to stay on pace.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading your goals...</div>
        ) : goals.length ? (
          <div className="table-list" style={{ marginTop: 18 }}>
            {goals.map((goal) => (
              <div className="table-row goal-row" key={goal._id}>
                <div>
                  <strong>{goal.title}</strong>
                  <div className="subtle">Target: Rs {goal.targetAmount.toFixed(2)} by {new Date(goal.targetDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}</div>
                  {goal.notes ? <div className="subtle">{goal.notes}</div> : null}
                </div>
                <div>
                  <div className="subtle">Saved</div>
                  <strong>Rs {goal.currentSaved.toFixed(2)}</strong>
                  <div className="subtle">{goal.progressPercent.toFixed(1)}% complete</div>
                </div>
                <div>
                  <div className="subtle">Monthly Plan</div>
                  <strong>Rs {goal.monthlyRequired.toFixed(2)}</strong>
                  <div className="subtle">{goal.monthsRemaining} months left</div>
                </div>
                <div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <button className="button-secondary" onClick={() => handleEdit(goal)}>Edit</button>
                    <button className="button-secondary" onClick={() => handleDelete(goal._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No saving goals yet. Create your first plan above.</div>
        )}
      </section>
    </Layout>
  );
}

export default Goals;
