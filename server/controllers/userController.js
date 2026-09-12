import {
  createListMeta,
  hasListQuery,
  parsePageSize,
  parseSort,
} from "../utils/listQuery.js";
import { ERROR_CODES, sendError } from "../utils/apiResponse.js";
import { withErrorHandling } from "../utils/controllerHandler.js";
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

export const updateProfile = withErrorHandling(async (req, res) => {
  const userId = req.user.id;
  const { nickname, phone } = req.body;
  const profileImage = req.file ? `/uploads/profile/${req.file.filename}` : null;

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
}, "프로필 업데이트 오류 :");

export const updateProfileImage = withErrorHandling(async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "이미지 파일이 없습니다.",
    });
  }

  const imageUrl = `/uploads/profile/${req.file.filename}`;

  const user = await updateUserProfileImage({ userId, imageUrl });
  return res.json({ message: "프로필 이미지가 업데이트되었습니다.", user });
}, "DB 업데이트 실패:");

export const verifyPassword = withErrorHandling(async (req, res) => {
  const { password } = req.body;
  const userId = req.user.id;

  await verifyUserPassword({ userId, password });
  return res.status(200).json({ message: "비밀번호 확인 완료" });
}, "비밀번호 확인 에러:");

export const updatePassword = withErrorHandling(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  await changeUserPassword({ userId, currentPassword, newPassword });
  return res.status(200).json({ message: "비밀번호가 변경되었습니다." });
}, "비밀번호 변경 오류 :");

export const getLoginLogs = withErrorHandling(async (req, res) => {
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
}, "로그인 기록 조회 오류:");

export const deleteMe = withErrorHandling(async (req, res) => {
  const userId = req.user.id;
  const { reason } = req.body;

  await deleteUserMe({ userId, reason });
  return res.status(200).json({ message: "회원 탈퇴가 완료되었습니다." });
}, "회원 탈퇴 오류 :");

export const updateNotifications = withErrorHandling(async (req, res) => {
  const userId = req.user.id;
  const { notifications } = req.body;

  await updateUserNotifications({ userId, notifications });
  return res.json({ message: "알림 설정이 업데이트되었습니다." });
}, "알림 설정 업데이트 오류 :");

export const getMe = withErrorHandling(async (req, res) => {
  const userId = req.user.id;

  const user = await getUserMe({ userId });
  return res.json(user);
}, "사용자 정보 조회 오류 :");
