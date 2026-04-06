import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updatePreferredLanguage,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/preferences/language", protect, updatePreferredLanguage);

export default router;
