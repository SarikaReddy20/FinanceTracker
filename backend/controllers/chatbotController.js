import mongoose from "mongoose";
import { buildChatbotReply } from "../services/chatbotService.js";
import User from "../models/User.js";

export const sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.user.id).select("preferredLanguage");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const reply = await buildChatbotReply({
      userId: new mongoose.Types.ObjectId(req.user.id),
      message,
      preferredLanguage: user.preferredLanguage,
    });

    return res.json({
      message: reply.reply,
      route: reply.route || null,
      data: reply.data || null,
      quickReplies: reply.quickReplies || [],
      language: user.preferredLanguage,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
