import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";
import { notifyTransactionsUpdated } from "../utils/reportEvents";

const INITIAL_VISIBLE_COUNT = 5;

function Profile() {
  const navigate = useNavigate();
  const { t, translateDocumentType, translateCategory } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [pdfDocuments, setPdfDocuments] = useState([]);
  const [billDocuments, setBillDocuments] = useState([]);
  const [manualTransactions, setManualTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [showAllPdfs, setShowAllPdfs] = useState(false);
  const [showAllBills, setShowAllBills] = useState(false);
  const [showAllManual, setShowAllManual] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedManual, setSelectedManual] = useState(null);

  useEffect(() => () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  useEffect(() => {
    let isMounted = true;

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
      return all;
    };

    const loadProfileData = async () => {
      try {
        setLoading(true);
        setStatus("");
        const [profileRes, pdfRes, billRes, manual] = await Promise.all([
          API.get("/auth/me"),
          API.get("/uploaded-documents", { params: { documentType: "PDF" } }),
          API.get("/uploaded-documents", { params: { documentType: "BILL" } }),
          fetchAllManual(),
        ]);

        if (!isMounted) {
          return;
        }

        setProfile(profileRes.data);
        setPdfDocuments(pdfRes.data.documents || []);
        setBillDocuments(billRes.data.documents || []);
        setManualTransactions(manual || []);
      } catch (error) {
        if (isMounted) {
          setStatus(error.response?.data?.message || t("profileLoadFailed"));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfileData();
    return () => {
      isMounted = false;
    };
  }, [t]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleDeleteDocument = async (documentId, type) => {
    try {
      setStatus("");
      await API.delete(`/uploaded-documents/${documentId}`);
      if (type === "PDF") {
        setPdfDocuments((current) => current.filter((item) => item._id !== documentId));
      } else {
        setBillDocuments((current) => current.filter((item) => item._id !== documentId));
      }
      if (previewDocument?._id === documentId) {
        closePreview();
      }
      notifyTransactionsUpdated();
      setStatus(t("uploadedFileDeleted"));
    } catch (error) {
      setStatus(error.response?.data?.message || t("uploadedFileDeleteFailed"));
    }
  };

  const handlePreviewDocument = async (document) => {
    try {
      setPreviewLoading(true);
      setStatus("");
      const res = await API.get(`/uploaded-documents/${document._id}/content`, {
        responseType: "blob",
      });
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
      const nextUrl = window.URL.createObjectURL(new Blob([res.data], { type: document.mimeType }));
      setPreviewUrl(nextUrl);
      setPreviewDocument(document);
    } catch (error) {
      setStatus(error.response?.data?.message || t("previewUnavailable"));
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setPreviewDocument(null);
  };

  const visiblePdfs = useMemo(
    () => (showAllPdfs ? pdfDocuments : pdfDocuments.slice(0, INITIAL_VISIBLE_COUNT)),
    [pdfDocuments, showAllPdfs],
  );
  const visibleBills = useMemo(
    () => (showAllBills ? billDocuments : billDocuments.slice(0, INITIAL_VISIBLE_COUNT)),
    [billDocuments, showAllBills],
  );
  const visibleManual = useMemo(
    () => (showAllManual ? manualTransactions : manualTransactions.slice(0, INITIAL_VISIBLE_COUNT)),
    [manualTransactions, showAllManual],
  );

  if (loading) {
    return (
      <Layout>
        <section className="surface-card report-card">
          <h3 style={{ marginTop: 0 }}>{t("profileLoadingTitle")}</h3>
          <p className="subtle">{t("profileLoadingCopy")}</p>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="glass-card hero-card">
        <div className="pill">{t("navProfile")}</div>
        <h1 className="headline" style={{ marginTop: 16 }}>{t("profileTitle")}</h1>
        <p className="subtle" style={{ maxWidth: 720, lineHeight: 1.7 }}>
          {t("profileSubtitle")}
        </p>
      </section>

      <section className="surface-card report-card">
        <div className="toolbar">
          <div>
            <h3 style={{ margin: 0 }}>{profile?.name || "-"}</h3>
            <p className="subtle" style={{ margin: "6px 0 0" }}>{profile?.email || "-"}</p>
          </div>
          <button className="button-primary" onClick={handleLogout}>{t("logout")}</button>
        </div>
      </section>

      {status ? <section className="surface-card report-card"><p className="subtle" style={{ margin: 0 }}>{status}</p></section> : null}

      <section className="surface-card report-card">
        <div className="toolbar">
          <div>
            <h3 style={{ margin: 0 }}>{t("profilePdfsTitle")}</h3>
            <p className="subtle" style={{ margin: "6px 0 0" }}>{t("profilePdfsCopy")}</p>
          </div>
          {pdfDocuments.length > INITIAL_VISIBLE_COUNT ? (
            <button className="button-secondary" onClick={() => setShowAllPdfs((current) => !current)}>
              {showAllPdfs ? t("showLess") : t("viewMore")}
            </button>
          ) : null}
        </div>
        {visiblePdfs.length ? (
          <div className="table-list" style={{ marginTop: 16 }}>
            {visiblePdfs.map((document) => (
              <div className="table-row" key={document._id}>
                <div>
                  <strong>{document.originalName}</strong>
                  <div className="subtle">
                    {translateDocumentType(document.documentType)} - {t("uploadedOn")}: {new Date(document.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </div>
                  <div className="subtle">
                    {t("transactionRange")}: {document.transactionStartDate
                      ? new Date(document.transactionStartDate).toLocaleDateString("en-IN", { dateStyle: "medium" })
                      : "-"} {" - "}
                    {document.transactionEndDate
                      ? new Date(document.transactionEndDate).toLocaleDateString("en-IN", { dateStyle: "medium" })
                      : "-"}
                  </div>
                </div>
                <div className="subtle">{(document.size / 1024 / 1024).toFixed(2)} MB</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <button className="button-secondary" onClick={() => handlePreviewDocument(document)}>{t("view")}</button>
                  <button className="button-secondary" onClick={() => handleDeleteDocument(document._id, "PDF")}>{t("delete")}</button>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="empty-state">{t("noUploadedFiles")}</div>}
      </section>

      <section className="surface-card report-card">
        <div className="toolbar">
          <div>
            <h3 style={{ margin: 0 }}>{t("profileBillsTitle")}</h3>
            <p className="subtle" style={{ margin: "6px 0 0" }}>{t("profileBillsCopy")}</p>
          </div>
          {billDocuments.length > INITIAL_VISIBLE_COUNT ? (
            <button className="button-secondary" onClick={() => setShowAllBills((current) => !current)}>
              {showAllBills ? t("showLess") : t("viewMore")}
            </button>
          ) : null}
        </div>
        {visibleBills.length ? (
          <div className="table-list" style={{ marginTop: 16 }}>
            {visibleBills.map((document) => (
              <div className="table-row" key={document._id}>
                <div>
                  <strong>{document.originalName}</strong>
                  <div className="subtle">
                    {translateDocumentType(document.documentType)} - {t("uploadedOn")}: {new Date(document.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </div>
                  <div className="subtle">
                    {t("transactionRange")}: {document.transactionStartDate
                      ? new Date(document.transactionStartDate).toLocaleDateString("en-IN", { dateStyle: "medium" })
                      : "-"} {" - "}
                    {document.transactionEndDate
                      ? new Date(document.transactionEndDate).toLocaleDateString("en-IN", { dateStyle: "medium" })
                      : "-"}
                  </div>
                </div>
                <div className="subtle">{(document.size / 1024 / 1024).toFixed(2)} MB</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <button className="button-secondary" onClick={() => handlePreviewDocument(document)}>{t("view")}</button>
                  <button className="button-secondary" onClick={() => handleDeleteDocument(document._id, "BILL")}>{t("delete")}</button>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="empty-state">{t("noUploadedFiles")}</div>}
      </section>

      <section className="surface-card report-card">
        <div className="toolbar">
          <div>
            <h3 style={{ margin: 0 }}>{t("profileManualTitle")}</h3>
            <p className="subtle" style={{ margin: "6px 0 0" }}>{t("profileManualCopy")}</p>
          </div>
          {manualTransactions.length > INITIAL_VISIBLE_COUNT ? (
            <button className="button-secondary" onClick={() => setShowAllManual((current) => !current)}>
              {showAllManual ? t("showLess") : t("viewMore")}
            </button>
          ) : null}
        </div>
        {visibleManual.length ? (
          <div className="table-list" style={{ marginTop: 16 }}>
            {visibleManual.map((item) => (
              <div className="table-row" key={item._id}>
                <div>
                  <strong>{item.description}</strong>
                  <div className="subtle">{translateCategory(item.category)} - {item.type}</div>
                </div>
                <div className="subtle">
                  {item.displayDate}
                  <div>{item.displayTime}</div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" }}>
                  <strong>Rs {Number(item.amount).toFixed(2)}</strong>
                  <button className="button-secondary" onClick={() => setSelectedManual(item)}>{t("view")}</button>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="empty-state">{t("noManualTransactions")}</div>}
      </section>

      {selectedManual ? (
        <section className="surface-card report-card">
          <div className="toolbar">
            <h3 style={{ margin: 0 }}>{t("manualTransactionDetails")}</h3>
            <button className="button-secondary" onClick={() => setSelectedManual(null)}>
              {t("closePreview")}
            </button>
          </div>
          <div className="detail-grid" style={{ marginTop: 14 }}>
            <div className="detail-item">
              <div className="subtle">{t("description")}</div>
              <strong>{selectedManual.description}</strong>
            </div>
            <div className="detail-item">
              <div className="subtle">{t("amount")}</div>
              <strong>Rs {Number(selectedManual.amount).toFixed(2)}</strong>
            </div>
            <div className="detail-item">
              <div className="subtle">{t("category")}</div>
              <strong>{translateCategory(selectedManual.category)}</strong>
            </div>
            <div className="detail-item">
              <div className="subtle">{t("date")}</div>
              <strong>{selectedManual.displayDate}</strong>
            </div>
            <div className="detail-item">
              <div className="subtle">{t("time")}</div>
              <strong>{selectedManual.displayTime}</strong>
            </div>
          </div>
        </section>
      ) : null}

      {previewLoading ? (
        <section className="surface-card report-card">
          <h3 style={{ marginTop: 0 }}>{t("previewTitle")}</h3>
          <p className="subtle">{t("previewLoading")}</p>
        </section>
      ) : null}

      {previewDocument && previewUrl ? (
        <section className="surface-card report-card">
          <div className="toolbar">
            <div>
              <h3 style={{ margin: 0 }}>{t("previewTitle")}</h3>
              <p className="subtle" style={{ margin: "6px 0 0" }}>{previewDocument.originalName}</p>
            </div>
            <button className="button-secondary" onClick={closePreview}>{t("closePreview")}</button>
          </div>
          {previewDocument.mimeType === "application/pdf" ? (
            <iframe className="document-preview-frame" src={previewUrl} title={previewDocument.originalName} />
          ) : (
            <img className="document-preview-image" src={previewUrl} alt={previewDocument.originalName} />
          )}
        </section>
      ) : null}
    </Layout>
  );
}

export default Profile;
