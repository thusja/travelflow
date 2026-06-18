import prisma from "../db/index.js";
import { ERROR_CODES, sendError } from "../utils/apiResponse.js";

export const getLoginLogs = async (req, res) => {
  const userId = req.user.id;

  try {
    const logs = await prisma.loginLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ip: true,
        userAgent: true,
        createdAt: true,
      },
    });

    res.json(
      logs.map((log) => ({
        id: log.id,
        ip: log.ip,
        user_agent: log.userAgent,
        created_at: log.createdAt,
      })),
    );
  } catch (err) {
    console.error("로그인 기록 조회 에러 : ", err);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "서버 에러",
    });
  }
};

// 탈퇴 처리
export const deleteMe = async (req, res) => {
  const userId = req.user.id;
  const { reason } = req.body;

  if (!reason || reason.trim() === "") {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "탈퇴 사유를 입력해주세요.",
    });
  }

  try {
    await prisma.withdrawalLog.create({
      data: {
        userId,
        reason,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return res.status(200).json({ message: "회원 탈퇴가 완료되었습니다." });
  } catch (err) {
    console.error("회원 탈퇴 오류 : ", err.message);
    console.error(err);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "서버 오류로 탈퇴에 실패했습니다.",
    });
  }
};

// 알림 설정 업데이트
export const updateNotifications = async (req, res) => {
  const userId = req.user.id;
  const { notifications } = req.body;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        notifications: notifications ?? {},
      },
    });
    return res.json({ message: "알림 설정이 업데이트되었습니다." });
  } catch (err) {
    console.error("알림 설정 업데이트 오류 : ", err);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "서버 오류",
    });
  }
};

export const getMe = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        isDeleted: false,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        nickname: true,
        email: true,
        phone: true,
        profileImage: true,
        notifications: true,
      },
    });

    if (!user) {
      return sendError(res, {
        status: 404,
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: "사용자 정보를 찾을 수 없습니다.",
      });
    }

    let parsedNotifications = {};
    try {
      if (typeof user.notifications === "string") {
        parsedNotifications = JSON.parse(user.notifications || "{}");
      } else {
        parsedNotifications = user.notifications || {};
      }
    } catch (e) {
      parsedNotifications = {};
    }

    res.json({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      notifications: parsedNotifications,
    });
  } catch (err) {
    console.error("사용자 정보 조회 오류 :", err);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "서버 오류",
    });
  }
};
