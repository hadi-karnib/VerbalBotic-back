import express from "express";
import {
  createVoiceNote,
  getMyChats,
  updateAfterAnalysis,
  updateAfterChatGPT,
} from "../Controllers/messageController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createVoiceNote);

router.get("/", authMiddleware, getMyChats);

router.patch("/:messageId/analysis", authMiddleware, updateAfterAnalysis);
router.patch("/:messageId/chatgpt", authMiddleware, updateAfterChatGPT);

export default router;
