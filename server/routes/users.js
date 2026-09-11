import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verifyToken } from "../middlewares/auth.js";
import {
  deleteMe,
  getLoginLogs,
  getMe,
  updateNotifications,
  updatePassword,
  updateProfile,
  updateProfileImage,
  verifyPassword,
} from "../controllers/userController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/profile";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.put("/profile", verifyToken, upload.single("image"), updateProfile);
router.put("/profile-image", verifyToken, upload.single("image"), updateProfileImage);
router.post("/verify-password", verifyToken, verifyPassword);
router.put("/password", verifyToken, updatePassword);
router.get("/logs", verifyToken, getLoginLogs);
router.get("/me", verifyToken, getMe);
router.delete("/me", verifyToken, deleteMe);
router.delete("/", verifyToken, deleteMe);
router.patch("/notifications", verifyToken, updateNotifications);

export default router;
