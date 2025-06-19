import express from "express";
import {
  createConversation,
  getConversations,
  sendMessage,
  getMessages,
} from "../controllers/messageController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/conversations", verifyToken, createConversation);
router.get("/conversations", verifyToken, getConversations);
router.get("/conversations/:conversationId/messages", verifyToken, getMessages);
router.post(
  "/conversations/:conversationId/messages",
  verifyToken,
  sendMessage
);

export default router;
