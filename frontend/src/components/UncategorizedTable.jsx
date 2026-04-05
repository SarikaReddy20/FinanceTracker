import API from "../services/api";
import { notifyTransactionsUpdated } from "../utils/reportEvents";

const CATEGORY_OPTIONS = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Entertainment",
  "Education",
  "Health",
  "Reimbursable",
  "Uncategorized",
];

function UncategorizedTable({ data, onUpdated }) {
  const updateCategory = async (id, category) => {
    if (!category) return;

    await API.put(`/transactions/update-category/${id}`, { category });
    notifyTransactionsUpdated();
    onUpdated?.(id);

    alert("Updated");
  };

  if (!data.length) {
    return <div className="empty-state">No uncategorized transactions right now.</div>;
  }

  return (
    <div className="table-list" style={{ marginTop: 18 }}>
      {data.map((item) => (
        <div key={item._id} className="table-row category-review-row">
          <div>
            <strong>{item.description}</strong>
            <div className="subtle">
              Rs {item.amount} - {item.displayDate || item.date}
            </div>
          </div>

          <div className="subtle">{item.category || "Uncategorized"}</div>

          <select className="field" onChange={(e) => updateCategory(item._id, e.target.value)}>
            <option value="">Select</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

export default UncategorizedTable;
