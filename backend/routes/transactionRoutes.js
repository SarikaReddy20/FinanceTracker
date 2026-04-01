import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  uploadPDF,
  updateCategory,
} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload-pdf", protect, upload.single("file"), uploadPDF);
router.put("/update-category/:id", protect, updateCategory);

export default router;
