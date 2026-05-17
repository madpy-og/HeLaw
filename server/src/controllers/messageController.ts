import { Request, Response } from "express";
import { uploadToCloudinary } from "../config/cloudinary";
import { createMessage } from "../models/messageModel";
import { createDocument } from "../models/documentModel";
import { analyzeMessageAndDocuments } from "../services/geminiService";
import { getConversationByIdAndUser } from "../models/conversationModel";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const conversationId = req.params.id as string;
    const { content } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!content && (!files || files.length === 0)) {
      return res.status(400).json({ success: false, message: "Pesan atau dokumen tidak boleh kosong" });
    }

    // Pastikan percakapan ini milik user yang sedang login
    const conversation = await getConversationByIdAndUser(conversationId, userId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Percakapan tidak ditemukan" });
    }

    // 1. Simpan pesan user ke database
    const userMessage = await createMessage(conversationId, "user", content || "");

    const uploadedDocuments: any[] = [];
    const filesForGemini: { url: string; mimeType: string }[] = [];

    // 2. Jika ada lampiran, upload ke Cloudinary dan simpan ke database
    if (files && files.length > 0) {
      for (const file of files) {
        // Tentukan resourceType (pdf -> raw, image -> image)
        const isPdf = file.mimetype === "application/pdf";
        const resourceType = isPdf ? "raw" : "image";
        
        const folderPath = `helaw/documents/${userId}`;
        const uploadResult = await uploadToCloudinary(file.buffer, folderPath, resourceType);

        // Simpan ke tabel documents
        const document = await createDocument(
          userMessage.id,
          uploadResult.url,
          isPdf ? "pdf" : "image",
          file.originalname
        );

        uploadedDocuments.push(document);
        filesForGemini.push({ url: uploadResult.url, mimeType: file.mimetype });
      }
    }

    // 3. Panggil Gemini Service
    const aiResponse = await analyzeMessageAndDocuments(content || "Tolong jelaskan isi dokumen ini.", filesForGemini);

    // 4. Simpan jawaban AI ke database
    const aiMessage = await createMessage(
      conversationId,
      "ai",
      aiResponse.explanation,
      aiResponse.actionableInsights
    );

    // 5. Kembalikan seluruh object sebagai balasan
    res.status(201).json({
      success: true,
      data: {
        user_message: {
          ...userMessage,
          documents: uploadedDocuments
        },
        ai_message: aiMessage
      }
    });

  } catch (error: any) {
    console.error("Error in sendMessage controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
