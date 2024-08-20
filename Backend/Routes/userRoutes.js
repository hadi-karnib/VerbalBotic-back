import express from "express";
import {
  signup,
  login,
  getAllUsers,
  getUser,
  deleteUser,
  getUserChats,
} from "../Controllers/userController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/", authMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUser);
router.delete("/:id", authMiddleware, deleteUser);
router.get("/:id/chats", authMiddleware, getUserChats);

export default router;
