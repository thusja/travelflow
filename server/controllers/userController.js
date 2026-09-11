import { prisma } from "../lib/prisma.js";
import dayjs from "dayjs";

export const getLoginLogs = async (req, res) => {
  const userId = req.user.id;

  try {
    const logs = await prisma.loginLog.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      select: { id: true, ip: true, user_agent: true, created_at: true },
    });

    res.json(logs);
  }
  catch(err) {
    console.error("로그인 기록 조회 에러 : ", err);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 탈퇴 처리
export const deleteMe = async (req, res) => {
  const userId = req.user.id;
  const { reason } = req.body;

  if(!reason || reason.trim() === "") {
    return res.status(400).json({ message: "탈퇴 사유를 입력해주세요." });
  }

  try {
    // 탈퇴 사유 로그 저장
    await prisma.withdrawalLog.create({
      data: {
        user_id: userId,
        reason,
        created_at: dayjs().toDate(),
      },
    });

    // users table에서 탈퇴 처리 (소프트 삭제)
    await prisma.user.update({
      where: { id: userId },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    return res.status(200).json({ message: "회원 탈퇴가 완료되었습니다."});
  }
  catch(err) {
    console.error("회원 탈퇴 오류 : ", err.message);
    console.error(err);
    return res.status(500).json({ message: "서버 오류로 탈퇴에 실패했습니다."});
  }
};

// 알림 설정 업데이트
export const updateNotifications = async (req, res) => {
  const userId = req.user.id;
  const { notifications } = req.body;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { notifications: JSON.stringify(notifications) },
    });
    return res.json({ message: "알림 설정이 업데이트되었습니다." });
  }
  catch(err) {
    console.error("알림 설정 업데이트 오류 : ", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

export const getMe = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findFirst({
      where: { id: userId, is_deleted: false },
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
      return res.status(404).json({ message: "사용자 정보를 찾을 수 없습니다." });
    }

    // notifications 파싱 처리
    try {
      if (typeof user.notifications === "string") {
        user.notifications = JSON.parse(user.notifications || "{}");
      } else {
        user.notifications = user.notifications || {};
      }
    } catch (e) {
      user.notifications = {};
    }

    res.json(user);
  }
  catch(err) {
    console.error("사용자 정보 조회 오류 :", err);
    res.status(500).json({ message: "서버 오류" });
  }
}
