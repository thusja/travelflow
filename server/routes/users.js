import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import { verifyToken } from "../middlewares/auth.js";
import prisma from "../db/index.js";
import {
  createListMeta,
  hasListQuery,
  parsePageSize,
  parseSort,
} from "../utils/listQuery.js";
import {
  deleteMe,
  updateNotifications,
  getMe,
} from "../controllers/userController.js";
import { ERROR_CODES, sendError } from "../utils/apiResponse.js";

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
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 최대 5MB
});

// 프로필 통합 수정 API
router.put(
  "/profile",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    const userId = req.user.id;
    const { nickname, phone } = req.body;
    const profileImage = req.file
      ? `/uploads/profile/${req.file.filename}`
      : null;

    try {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!existingUser)
        return sendError(res, {
          status: 404,
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: "사용자를 찾을 수 없습니다.",
        });

      const updateData = {};

      if (nickname) {
        updateData.nickname = nickname;
      }

      if (phone) {
        updateData.phone = phone;
      }

      if (profileImage) {
        updateData.profileImage = profileImage;
      }

      if (Object.keys(updateData).length === 0) {
        return sendError(res, {
          status: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: "업데이트할 항목이 없습니다.",
        });
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          nickname: true,
          firstname: true,
          lastname: true,
          email: true,
          phone: true,
          profileImage: true,
          createdAt: true,
        },
      });

      res.status(200).json({
        message: "프로필이 업데이트되었습니다.",
        user: {
          id: updated.id,
          nickname: updated.nickname,
          firstname: updated.firstname,
          lastname: updated.lastname,
          email: updated.email,
          phone: updated.phone,
          profileImage: updated.profileImage,
          created_at: updated.createdAt,
        },
      });
    } catch (err) {
      console.error("프로필 업데이트 오류 : ", err);
      return sendError(res, {
        status: 500,
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "서버 오류",
      });
    }
  },
);

// 프로필 이미지 업로드 API (단독 사용 시) (필요없을 시 삭제 가능)
router.put(
  "/profile-image",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    if (!req.file)
      return sendError(res, {
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "이미지 파일이 없습니다.",
      });

    const imageUrl = `/uploads/profile/${req.file.filename}`;
    const userId = req.user.id;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profileImage: imageUrl,
        },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          nickname: true,
          phone: true,
          profileImage: true,
        },
      });

      res.json({
        message: "프로필 이미지가 업데이트되었습니다.",
        user: {
          id: updatedUser.id,
          name: `${updatedUser.lastname}${updatedUser.firstname}`,
          email: updatedUser.email,
          nickname: updatedUser.nickname,
          phone: updatedUser.phone,
          profileImage: updatedUser.profileImage,
        },
      });
    } catch (err) {
      console.error("DB 업데이트 실패:", err);
      return sendError(res, {
        status: 500,
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "서버 오류",
      });
    }
  },
);

// 현재 비밀번호 검증 API
router.post("/verify-password", verifyToken, async (req, res) => {
  const { password } = req.body;
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    if (!user) {
      return sendError(res, {
        status: 404,
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return sendError(res, {
        status: 401,
        code: ERROR_CODES.AUTH_UNAUTHORIZED,
        message: "비밀번호가 일치하지 않습니다.",
      });
    }

    res.status(200).json({ message: "비밀번호 확인 완료" });
  } catch (err) {
    console.error("비밀번호 확인 에러:", err);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "서버 에러",
    });
  }
});

// 비밀번호 변경 API
router.put("/password", verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      return sendError(res, {
        status: 404,
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: "사용자를 찾을 수 없습니다.",
      });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match)
      return sendError(res, {
        status: 401,
        code: ERROR_CODES.AUTH_UNAUTHORIZED,
        message: "현재 비밀번호가 일치하지 않습니다.",
      });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashed,
      },
    });

    res.status(200).json({ message: "비밀번호가 변경되었습니다." });
  } catch (err) {
    console.error("비밀번호 변경 오류 : ", err);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "서버 오류",
    });
  }
});

// Login log API
router.get("/logs", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter = "", sort } = req.query;
    const { page, size, skip, take } = parsePageSize(req.query);
    const sortInfo = parseSort(sort, ["createdAt", "ip"], {
      key: "createdAt",
      direction: "desc",
    });

    const where = {
      userId,
      ...(filter && typeof filter === "string"
        ? {
            OR: [
              {
                ip: {
                  contains: filter,
                  mode: "insensitive",
                },
              },
              {
                userAgent: {
                  contains: filter,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    if (!userId) {
      return sendError(res, {
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "User ID가 존재하지 않습니다.",
      });
    }

    const total = await prisma.loginLog.count({ where });

    const logs = await prisma.loginLog.findMany({
      where,
      orderBy: {
        [sortInfo.key]: sortInfo.direction,
      },
      skip,
      take,
    });

    const mapped = logs.map((log) => ({
      id: log.id,
      user_id: log.userId,
      ip: log.ip,
      user_agent: log.userAgent,
      created_at: log.createdAt,
    }));

    if (hasListQuery(req.query)) {
      return res.status(200).json({
        items: mapped,
        meta: createListMeta({ page, size, total }),
      });
    }

    res.status(200).json(mapped);
  } catch (err) {
    console.error("로그인 기록 조회 오류:", err);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "서버 오류 발생",
    });
  }
});

router.get("/me", verifyToken, getMe);

// 클라이언트 경로 호환: DELETE /api/users/me
router.delete("/me", verifyToken, deleteMe);

// 레거시 경로 호환: DELETE /api/users
router.delete("/", verifyToken, deleteMe);

router.patch("/notifications", verifyToken, updateNotifications);

export default router;
