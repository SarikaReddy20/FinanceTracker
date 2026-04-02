import API from "../services/api";

function UncategorizedTable({ data }) {
  const updateCategory = async (id, category) => {
    if (!category) return;

    await API.put(`/transactions/update-category/${id}`, { category });

    alert("Updated");
  };

  if (!data.length) return <p>No uncategorized transactions</p>;

  return (
    <div>
      <h3>Uncategorized</h3>

      {data.map((item) => (
        <div key={item._id} style={{ marginBottom: "10px" }}>
          <b>{item.description}</b> — ₹{item.amount}
          <select onChange={(e) => updateCategory(item._id, e.target.value)}>
            <option value="">Select</option>
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Entertainment</option>
          </select>
        </div>
      ))}
    </div>
  );
}

export default UncategorizedTable;
