import express from "express";
import {
  signup,
  login,
  getAllUsers,
  getUser,
  deleteUser,
  getUserChats,
  addBio,
  getSelf,
} from "../Controllers/userController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/self", authMiddleware, getSelf);
router.get("/", authMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUser);
router.get("/:id/chats", authMiddleware, getUserChats);
router.put("/add-bio", authMiddleware, addBio);
router.delete("/:id", authMiddleware, deleteUser);

export default router;
