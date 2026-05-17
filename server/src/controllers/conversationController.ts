import { Request, Response } from "express";
import {
  createConversation,
  deleteConversation,
  getConversationByIdAndUser,
  getConversationsByUserId,
  updateConversationTitle,
} from "../models/conversationModel";
import { getConversationMessagesWithDocuments } from "../models/messageModel";

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const conversations = await getConversationsByUserId(userId, limit, offset);

    res.status(200).json({ success: true, data: conversations });
  } catch (error: any) {
    console.error("Error in getConversations controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createNewConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { title } = req.body;

    const newConversation = await createConversation(userId, title);

    res.status(201).json({ success: true, data: newConversation });
  } catch (error: any) {
    console.error("Error in createNewConversation controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getConversationDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const conversationId = req.params.id as string;

    // Optional pagination for messages
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const conversation = await getConversationByIdAndUser(conversationId, userId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Percakapan tidak ditemukan" });
    }

    const messages = await getConversationMessagesWithDocuments(conversationId, limit, offset);

    res.status(200).json({
      success: true,
      data: {
        ...conversation,
        messages,
      },
    });
  } catch (error: any) {
    console.error("Error in getConversationDetails controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const conversationId = req.params.id as string;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Judul percakapan diperlukan" });
    }

    const updatedConversation = await updateConversationTitle(conversationId, userId, title);

    if (!updatedConversation) {
      return res.status(404).json({ success: false, message: "Percakapan tidak ditemukan" });
    }

    res.status(200).json({ success: true, data: updatedConversation });
  } catch (error: any) {
    console.error("Error in updateConversation controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteConversationById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const conversationId = req.params.id as string;

    const deleted = await deleteConversation(conversationId, userId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Percakapan tidak ditemukan" });
    }

    res.status(200).json({ success: true, message: "Percakapan berhasil dihapus" });
  } catch (error: any) {
    console.error("Error in deleteConversationById controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
