import { useState } from "react";
import API from "../services/api";
import UncategorizedTable from "../components/UncategorizedTable";
import Layout from "../components/Layout";

function UploadPDF() {
  const [file, setFile] = useState(null);
  const [uncategorized, setUncategorized] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await API.post("/transactions/upload-pdf", formData);

      setUncategorized(res.data.uncategorized);

      alert(
        `Added: ${res.data.totalAdded}, Duplicates: ${res.data.duplicatesCount}`,
      );
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h2>Upload PDF</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      <UncategorizedTable data={uncategorized} />
    </Layout>
  );
}

export default UploadPDF;
