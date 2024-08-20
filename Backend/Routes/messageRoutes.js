import express from "express";
import {
  createVoiceNote,
  updateAfterAnalysis,
  updateAfterChatGPT,
} from "../Controllers/messageController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createVoiceNote);

router.patch("/:messageId/analysis", authMiddleware, updateAfterAnalysis);

router.patch("/:messageId/chatgpt", authMiddleware, updateAfterChatGPT);

export default router;
