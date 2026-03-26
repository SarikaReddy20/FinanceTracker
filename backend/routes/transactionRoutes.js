import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  uploadPDF,
  updateCategory,
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/upload-pdf", upload.single("file"), uploadPDF);
router.put("/update-category/:id", updateCategory);

export default router;
