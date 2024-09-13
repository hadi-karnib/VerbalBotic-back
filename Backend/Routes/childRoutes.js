import express from "express";
import {
  addChild,
  deleteChild,
  getChildren,
} from "../Controllers/childController.js";
import {
  authMiddleware,
  parentMiddleware,
} from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, parentMiddleware, addChild);
router.get("/", authMiddleware, parentMiddleware, getChildren);

router.delete(
  "/delete/:childId",
  authMiddleware,
  parentMiddleware,
  deleteChild
);

export default router;
