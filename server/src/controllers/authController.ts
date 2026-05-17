import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail, findUserById, updateUser } from "../models/userModel";

const generateTokenAndSetCookie = (userId: string, res: Response) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Semua field harus diisi" });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email sudah digunakan" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await createUser(name, email, passwordHash);

    if (newUser) {
      generateTokenAndSetCookie(newUser.id, res);
      return res.status(201).json({
        success: true,
        data: newUser,
      });
    } else {
      return res.status(400).json({ success: false, message: "Gagal membuat pengguna" });
    }
  } catch (error: any) {
    console.error("Error in register controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email dan password harus diisi" });
    }

    const user = await findUserByEmail(email);
    const isPasswordCorrect = await bcrypt.compare(password, user?.password_hash || "");

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ success: false, message: "Email atau password salah" });
    }

    generateTokenAndSetCookie(user.id, res);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("Error in login controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ success: true, message: "Berhasil logout" });
  } catch (error: any) {
    console.error("Error in logout controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    console.error("Error in getMe controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Nama dan email harus diisi" });
    }

    // Check if new email is already used by another user
    const existingUser = await findUserByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ success: false, message: "Email sudah digunakan oleh akun lain" });
    }

    const updatedUser = await updateUser(userId, name, email);

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error: any) {
    console.error("Error in updateMe controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
