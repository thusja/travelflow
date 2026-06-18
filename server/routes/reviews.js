import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { dirname } from "path";
import prisma from "../db/index.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 자동 폴더 생성
const uploadDir = path.join(__dirname, "../uploads/reviews");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 이미지 업로드 설정
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.test(ext)) {
      return cb(new Error("지원하지 않는 이미지 형식입니다."), false);
    }
    cb(null, true);
  },
});

// 후기 작성
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const userId = req.user.id;

    const existing = await prisma.review.findFirst({
      where: { bookingId, userId },
      select: { id: true },
    });
    if (existing) {
      return res.status(400).json({ message: "이미 작성된 후기입니다." });
    }

    const imageUrl = req.file ? `/uploads/reviews/${req.file.filename}` : null;

    await prisma.review.create({
      data: {
        id: uuidv4(),
        userId,
        bookingId,
        rating: Number(rating),
        comment,
        imageUrl,
      },
    });

    res.status(201).json({ message: "후기가 등록되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "후기 등록 실패" });
  }
});

// 후기 작성 가능한 예약 조회
router.get("/reviewable", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const rows = await prisma.booking.findMany({
      where: {
        userId,
        status: "completed",
      },
      orderBy: { bookingDate: "desc" },
      select: {
        id: true,
        bookingDate: true,
        pkg: {
          select: {
            title: true,
          },
        },
        reviews: {
          where: {
            userId,
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    const result = rows.map((row) => ({
      bookingId: row.id,
      title: row.pkg.title,
      booking_date: row.bookingDate,
      reviewId: row.reviews[0]?.id ?? null,
      reviewed: !!row.reviews[0]?.id,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "예약 목록 조회 실패" });
  }
});

// 후기 삭제 (소프트 삭제)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await prisma.review.findFirst({
      where: {
        id,
        userId,
      },
      select: { id: true },
    });
    if (!review) {
      return res.status(404).json({ message: "후기를 찾을 수 없습니다." });
    }

    await prisma.review.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
      },
    });

    res.json({ message: "후기가 삭제되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "후기 삭제 실패" });
  }
});

export default router;
