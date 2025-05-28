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

// 프로필 통합 수정 API
router.put("/profile", verifyToken, upload.single("image"), async (req, res) => {
  const userId = req.user.id;
  const { nickname, phone } = req.body;
  const profileImage =req.file ? `/uploads/profile/${req.file.filename}` : null;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    const updates = [];
    const values = [];

    if(nickname) {
      updates.push("nickname = ?");
      values.push(nickname);
    }

    if(phone) {
      updates.push("phone = ?");
      values.push(phone);
    }

    if(profileImage) {
      updates.push("profileImage = ?");
      values.push(profileImage);
    }

    if(updates.length === 0) {
      return res.status(400).json({ message: "업데이트할 항목이 없습니다." });
    }

    await db.query(
      `UPDATE users SET ${updates.join(", ")}, updated_at = NOW() WHERE id = ?`,
      [...values, userId]
    );

    const [updated] = await db.query(
      "SELECT id, nickname, firstname, lastname, email, phone, profileImage, created_at FROM users WHERE id = ?",
      [userId]
    );

    res.status(200).json({
      message: "프로필이 업데이트되었습니다.",
      user: updated[0],
    });
  }
  catch(err) {
    console.error("프로필 업데이트 오류 : ", err);
    res.status(500).json({ message: "서버 오류"});
  }
});

// 프로필 이미지 업로드 API (단독 사용 시) (필요없을 시 삭제 가능)
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
