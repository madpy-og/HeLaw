import express from "express";
import multer from "multer";
import { protectRoute } from "../middlewares/authMiddleware";
import { sendMessage } from "../controllers/messageController";

const router = express.Router({ mergeParams: true });

// Setup multer untuk menyimpan file ke memory (sebelum di-upload ke Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.use(protectRoute);

// POST /api/conversations/:id/messages
router.post("/", upload.array("files", 5), sendMessage);

export default router;
