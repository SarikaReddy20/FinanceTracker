import API from "../services/api";

function UncategorizedTable({ data }) {
  const updateCategory = async (id, category) => {
    await API.put(`/transactions/update-category/${id}`, { category });
    alert("Updated");
  };

  return (
    <div>
      {data.map((item) => (
        <div key={item._id}>
          {item.description} ₹{item.amount}
          <select onChange={(e) => updateCategory(item._id, e.target.value)}>
            <option>Select</option>
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Bills</option>
          </select>
        </div>
      ))}
    </div>
  );
}

export default UncategorizedTable;
