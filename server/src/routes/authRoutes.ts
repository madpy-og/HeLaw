import express from "express";
import { login, logout, register, getMe, updateMe } from "../controllers/authController";
import { protectRoute } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", protectRoute, getMe);
router.put("/me", protectRoute, updateMe);

export default router;
