import db from "../db/index.js";
import dayjs from "dayjs";

export const getLoginLogs = async (req, res) => {
  const userId = req.user.id;

  try {
    const [logs] = await db.query(
      "SELECT id, ip, user_agent, created_at FROM login_logs WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

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
    await db.query(
      "INSERT INTO withdrawal_logs (user_id, reason, created_at) VALUES (?, ? ,?)",
      [userId, reason, dayjs().format("YYYY-MM-DD HH:mm:ss")]
    );

    // users table에서 탈퇴 처리 (소프트 삭제)
    await db.query(
      "UPDATE users SET is_deleted = 1, deleted_at = NOW(), updated_at = NOW() WHERE id = ?",
      [userId]
    );

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
    await db.query(
      "UPDATE Users SET notifications = ? WHERE id = ?",
      [JSON.stringify(notifications), userId]
    );
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
    const [rows] = await db.query(
      "SELECT id, firstname, lastname, nickname, email, phone, profileImage, notifications FROM users WHERE id = ? AND is_deleted = 0",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "사용자 정보를 찾을 수 없습니다." });
    }

    const user = rows[0];

    // notifications 파싱 처리
    try {
      user.notifications = JSON.parse(user.notifications || "{}");
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
