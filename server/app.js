import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import packagesRouter from "./routes/packages.js";
import authRoutes from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import reviewsRouter from "./routes/reviews.js";
import pointAndCouponRouter from "./routes/pointAndCoupon.js";
import utilsRouter from"./routes/utils.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 기본 미들웨어
app.use(cors());
app.use(express.json());

// 정적 파일 서빙 (프로필 이미지용)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API 라우트
app.use("/api/auth", authRoutes);
app.use("/api/packages", packagesRouter);
app.use("/api/users", usersRouter);
app.use("/api/review", reviewsRouter);
app.use("/api/points", pointAndCouponRouter);
app.use("/api", utilsRouter);

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ Express server is running on http://localhost:${PORT}`);
});
