import express from "express";
import { sendChatMessage } from "../controllers/chatbotController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/message", protect, sendChatMessage);

export default router;
