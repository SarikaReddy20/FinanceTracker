import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  deleteUploadedDocument,
  getUploadedDocumentContent,
  listUploadedDocuments,
} from "../controllers/uploadedDocumentController.js";

const router = express.Router();

router.get("/", protect, listUploadedDocuments);
router.get("/:id/content", protect, getUploadedDocumentContent);
router.delete("/:id", protect, deleteUploadedDocument);

export default router;
