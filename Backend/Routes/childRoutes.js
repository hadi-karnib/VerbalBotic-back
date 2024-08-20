import express from "express";
import { addChild, deleteChild } from "../Controllers/childController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addChild);

router.delete("/delete/:childId", authMiddleware, deleteChild);

export default router;
