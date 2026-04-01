import { useState } from "react";
import API from "../services/api";
import UncategorizedTable from "../components/UncategorizedTable";

function UploadPDF() {
  const [file, setFile] = useState(null);
  const [uncategorized, setUncategorized] = useState([]);

  const handleUpload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/transactions/upload-pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUncategorized(res.data.uncategorized);
    } catch (err) {
      console.log("ERROR:", err.response?.data);

      alert(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div>
      <h2>Upload PDF</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button onClick={handleUpload}>Upload</button>

      <UncategorizedTable data={uncategorized} />
    </div>
  );
}

export default UploadPDF;
