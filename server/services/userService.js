import bcrypt from "bcrypt";
import prisma from "../db/index.js";
import { ERROR_CODES } from "../utils/apiResponse.js";
import { throwServiceError } from "./serviceError.js";

export const updateUserProfile = async ({ userId, nickname, phone, profileImage }) => {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    throwServiceError({
      status: 404,
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: "사용자를 찾을 수 없습니다.",
    });
  }

  const updateData = {};
  if (nickname) updateData.nickname = nickname;
  if (phone) updateData.phone = phone;
  if (profileImage) updateData.profileImage = profileImage;

  if (Object.keys(updateData).length === 0) {
    throwServiceError({
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

  return {
    id: updated.id,
    nickname: updated.nickname,
    firstname: updated.firstname,
    lastname: updated.lastname,
    email: updated.email,
    phone: updated.phone,
    profileImage: updated.profileImage,
    created_at: updated.createdAt,
  };
};

export const updateUserProfileImage = async ({ userId, imageUrl }) => {
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

  return {
    id: updatedUser.id,
    name: `${updatedUser.lastname}${updatedUser.firstname}`,
    email: updatedUser.email,
    nickname: updatedUser.nickname,
    phone: updatedUser.phone,
    profileImage: updatedUser.profileImage,
  };
};

export const verifyUserPassword = async ({ userId, password }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) {
    throwServiceError({
      status: 404,
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: "사용자를 찾을 수 없습니다.",
    });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throwServiceError({
      status: 401,
      code: ERROR_CODES.AUTH_UNAUTHORIZED,
      message: "비밀번호가 일치하지 않습니다.",
    });
  }
};

export const changeUserPassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throwServiceError({
      status: 404,
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: "사용자를 찾을 수 없습니다.",
    });
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    throwServiceError({
      status: 401,
      code: ERROR_CODES.AUTH_UNAUTHORIZED,
      message: "현재 비밀번호가 일치하지 않습니다.",
    });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashed,
    },
  });
};

export const getUserLoginLogs = async ({ userId, filter, sortInfo, skip, take }) => {
  if (!userId) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "User ID가 존재하지 않습니다.",
    });
  }

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

  const total = await prisma.loginLog.count({ where });
  const logs = await prisma.loginLog.findMany({
    where,
    orderBy: {
      [sortInfo.key]: sortInfo.direction,
    },
    skip,
    take,
  });

  const items = logs.map((log) => ({
    id: log.id,
    user_id: log.userId,
    ip: log.ip,
    user_agent: log.userAgent,
    created_at: log.createdAt,
  }));

  return { total, items };
};

export const deleteUserMe = async ({ userId, reason }) => {
  if (!reason || reason.trim() === "") {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "탈퇴 사유를 입력해주세요.",
    });
  }

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
};

export const updateUserNotifications = async ({ userId, notifications }) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      notifications: notifications ?? {},
    },
  });
};

export const getUserMe = async ({ userId }) => {
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
    throwServiceError({
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
  } catch {
    parsedNotifications = {};
  }

  return {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    nickname: user.nickname,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    notifications: parsedNotifications,
  };
};
