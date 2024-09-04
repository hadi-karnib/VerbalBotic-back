import express from "express";
import {
  createVoiceNote,
  fetchChildChats,
  getMyChats,
  parentAdvice,
  transcribeAudioGoogle,
  updateAfterAnalysis,
  updateAfterChatGPT,
} from "../Controllers/messageController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createVoiceNote);
router.post("/transcribeGoogle", authMiddleware, transcribeAudioGoogle);
router.post("/", authMiddleware, parentAdvice);


router.get("/", authMiddleware, getMyChats);
router.post("/child-chats", authMiddleware, fetchChildChats);
router.patch("/:messageId/analysis", authMiddleware, updateAfterAnalysis);
router.patch("/:messageId/chatgpt", authMiddleware, updateAfterChatGPT);

export default router;
