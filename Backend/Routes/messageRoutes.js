import express from "express";
import {
  adminMessages,
  createVoiceNote,
  fetchChildChats,
  getMyChats,
  markHomeworkAsCompleted,
  parentAdvice,
  transcribeAudioGoogle,
  updateAfterAnalysis,
  updateAfterChatGPT,
} from "../Controllers/messageController.js";
import {
  authMiddleware,
  parentMiddleware,
} from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createVoiceNote);
router.post("/transcribeGoogle", authMiddleware, transcribeAudioGoogle);
router.post("/child-chats", authMiddleware, parentMiddleware, fetchChildChats);
router.post("/parentAdvice", authMiddleware, parentMiddleware, parentAdvice);
router.post("/parentMessage", authMiddleware, parentMiddleware, adminMessages);

router.get("/", authMiddleware, getMyChats);

router.patch("/:messageId/analysis", authMiddleware, updateAfterAnalysis);
router.patch("/:messageId/chatgpt", authMiddleware, updateAfterChatGPT);
router.patch("/homework", authMiddleware, markHomeworkAsCompleted);

export default router;
