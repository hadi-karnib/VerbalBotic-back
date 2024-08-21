import express from "express";
import {
  addChild,
  deleteChild,
  getChildren,
} from "../Controllers/childController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addChild);
router.get("/", authMiddleware, getChildren);

router.delete("/delete/:childId", authMiddleware, deleteChild);

export default router;
