import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import billUpload from "../middleware/billUploadMiddleware.js";
import {
  uploadPDF,
  uploadBill,
  updateCategory,
  addManualTransaction,
} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload-pdf", protect, upload.single("file"), uploadPDF);
router.post("/upload-bill", protect, billUpload.single("file"), uploadBill);
router.put("/update-category/:id", protect, updateCategory);
router.post("/manual", protect, addManualTransaction);

export default router;
