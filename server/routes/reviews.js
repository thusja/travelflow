import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { verifyToken } from "../middlewares/auth.js";
import {
  createReviewHandler,
  deleteReviewHandler,
  getReviewableHandler,
} from "../controllers/reviewController.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads/reviews");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

router.post("/", verifyToken, upload.single("image"), createReviewHandler);
router.get("/reviewable", verifyToken, getReviewableHandler);
router.delete("/:id", verifyToken, deleteReviewHandler);

export default router;
