import API from "../services/api";
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
  "Uncategorized",
];

function UncategorizedTable({ data, onUpdated }) {
  const { t, translateCategory } = useLanguage();

  const updateCategory = async (id, category) => {
    if (!category) return;

    await API.put(`/transactions/update-category/${id}`, { category });
    notifyTransactionsUpdated();
    onUpdated?.(id);
  };

  if (!data.length) {
    return <div className="empty-state">{t("noUncategorizedTransactions")}</div>;
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

          <div className="subtle">{translateCategory(item.category || "Uncategorized")}</div>

          <select className="field" onChange={(e) => updateCategory(item._id, e.target.value)}>
            <option value="">{t("select")}</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option}>{translateCategory(option)}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

export default UncategorizedTable;
