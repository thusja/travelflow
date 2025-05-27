import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verifyToken } from "../middlewares/auth.js";
import db from "../db/index.js";

const router = express.Router();

// Multer 스토리지 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/profile";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 최대 5MB
});

// 프로필 이미지 업로드 API
router.put("/profile-image", verifyToken, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "이미지 파일이 없습니다." });

  const imageUrl = `/uploads/profile/${req.file.filename}`;
  const userId = req.user.id;

  try {
    // DB에 저장
    await db.query("UPDATE users SET profileImage = ? WHERE id = ?", [imageUrl, userId]);

    // 갱신된 사용자 정보 반환
    const [rows] = await db.query(
      "SELECT id, name, email, nickname, phone, profileImage FROM users WHERE id = ?",
      [userId]
    );

    res.json({ message: "프로필 이미지가 업데이트되었습니다.", user: rows[0] });
  } catch (err) {
    console.error("DB 업데이트 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

export default router;
