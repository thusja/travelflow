import {
  createListMeta,
  hasListQuery,
  parsePageSize,
  parseSort,
} from "../utils/listQuery.js";
import { ERROR_CODES, sendError } from "../utils/apiResponse.js";
import {
  changeUserPassword,
  deleteUserMe,
  getUserLoginLogs,
  getUserMe,
  updateUserNotifications,
  updateUserProfile,
  updateUserProfileImage,
  verifyUserPassword,
} from "../services/userService.js";
import { toErrorPayload } from "../services/serviceError.js";

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { nickname, phone } = req.body;
  const profileImage = req.file ? `/uploads/profile/${req.file.filename}` : null;

  try {
    const user = await updateUserProfile({
      userId,
      nickname,
      phone,
      profileImage,
    });

    return res.status(200).json({
      message: "프로필이 업데이트되었습니다.",
      user,
    });
  } catch (err) {
    console.error("프로필 업데이트 오류 : ", err);
    return sendError(res, toErrorPayload(err));
  }
};

export const updateProfileImage = async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "이미지 파일이 없습니다.",
    });
  }

  const imageUrl = `/uploads/profile/${req.file.filename}`;

  try {
    const user = await updateUserProfileImage({ userId, imageUrl });
    return res.json({ message: "프로필 이미지가 업데이트되었습니다.", user });
  } catch (err) {
    console.error("DB 업데이트 실패:", err);
    return sendError(res, toErrorPayload(err));
  }
};

export const verifyPassword = async (req, res) => {
  const { password } = req.body;
  const userId = req.user.id;

  try {
    await verifyUserPassword({ userId, password });
    return res.status(200).json({ message: "비밀번호 확인 완료" });
  } catch (err) {
    console.error("비밀번호 확인 에러:", err);
    return sendError(res, toErrorPayload(err));
  }
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    await changeUserPassword({ userId, currentPassword, newPassword });
    return res.status(200).json({ message: "비밀번호가 변경되었습니다." });
  } catch (err) {
    console.error("비밀번호 변경 오류 : ", err);
    return sendError(res, toErrorPayload(err));
  }
};

export const getLoginLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter = "", sort } = req.query;
    const { page, size, skip, take } = parsePageSize(req.query);
    const sortInfo = parseSort(sort, ["createdAt", "ip"], {
      key: "createdAt",
      direction: "desc",
    });

    const { total, items } = await getUserLoginLogs({
      userId,
      filter,
      sortInfo,
      skip,
      take,
    });

    if (hasListQuery(req.query)) {
      return res.status(200).json({
        items,
        meta: createListMeta({ page, size, total }),
      });
    }

    return res.status(200).json(items);
  } catch (err) {
    console.error("로그인 기록 조회 오류:", err);
    return sendError(res, toErrorPayload(err));
  }
};

export const deleteMe = async (req, res) => {
  const userId = req.user.id;
  const { reason } = req.body;

  try {
    await deleteUserMe({ userId, reason });
    return res.status(200).json({ message: "회원 탈퇴가 완료되었습니다." });
  } catch (err) {
    console.error("회원 탈퇴 오류 : ", err.message);
    return sendError(res, toErrorPayload(err));
  }
};

export const updateNotifications = async (req, res) => {
  const userId = req.user.id;
  const { notifications } = req.body;

  try {
    await updateUserNotifications({ userId, notifications });
    return res.json({ message: "알림 설정이 업데이트되었습니다." });
  } catch (err) {
    console.error("알림 설정 업데이트 오류 : ", err);
    return sendError(res, toErrorPayload(err));
  }
};

export const getMe = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await getUserMe({ userId });
    return res.json(user);
  } catch (err) {
    console.error("사용자 정보 조회 오류 :", err);
    return sendError(res, toErrorPayload(err));
  }
};
