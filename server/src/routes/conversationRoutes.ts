import express from "express";
import { protectRoute } from "../middlewares/authMiddleware";
import {
  createNewConversation,
  deleteConversationById,
  getConversationDetails,
  getConversations,
  updateConversation,
} from "../controllers/conversationController";

const router = express.Router();

// Apply authentication middleware to all routes in this router
router.use(protectRoute);

router.get("/", getConversations);
router.post("/", createNewConversation);
router.get("/:id", getConversationDetails);
router.put("/:id", updateConversation);
router.delete("/:id", deleteConversationById);

export default router;
