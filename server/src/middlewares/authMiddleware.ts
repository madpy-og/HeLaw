import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { findUserById } from "../models/userModel";

export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ success: false, message: "Akses ditolak - Tidak ada token yang diberikan" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };

    if (!decoded) {
      return res.status(401).json({ success: false, message: "Akses ditolak - Token tidak valid" });
    }

    const user = await findUserById(decoded.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    (req as any).user = user;

    next();
  } catch (error: any) {
    console.log("Error in protectRoute middleware:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
