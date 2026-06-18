import bcrypt from "bcrypt";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import prisma from "../db/index.js";
import { ERROR_CODES, sendError } from "../utils/apiResponse.js";

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "14d";
const REFRESH_SECRET =
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createAccessToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN },
  );

const createRefreshToken = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      type: "refresh",
      jti: crypto.randomUUID(),
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN },
  );

  const decoded = jwt.decode(token);
  const expMs = decoded?.exp
    ? decoded.exp * 1000
    : Date.now() + 14 * 24 * 60 * 60 * 1000;

  return {
    token,
    expiresAt: new Date(expMs),
  };
};

// 회원가입 - 순수 저장만
export const signup = async (req, res) => {
  const { nickname, firstname, lastname, email, password, phone } = req.body;
  const defaultProfilePath = "/uploads/profile/default-profile.png";

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, {
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "이미 사용 중인 이메일 입니다.",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await prisma.user.create({
      data: {
        id,
        nickname,
        firstname,
        lastname,
        email,
        password: hashed,
        phone,
        profileImage: defaultProfilePath,
      },
    });

    return res.status(201).json({ message: "회원가입 성공", userId: id });
  } catch (err) {
    console.error("회원가입 에러 : ", err);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "서버 에러",
    });
  }
};

// 로그인 - JWT 발급
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, {
        status: 401,
        code: ERROR_CODES.AUTH_UNAUTHORIZED,
        message: "아이디 또는 비밀번호가 일치하지 않습니다.",
      });
    }

    if (user.isDeleted) {
      return sendError(res, {
        status: 403,
        code: ERROR_CODES.AUTH_FORBIDDEN,
        message: "해당 계정은 탈퇴 처리된 상태입니다. 재가입 후 이용해주세요.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return sendError(res, {
        status: 401,
        code: ERROR_CODES.AUTH_UNAUTHORIZED,
        message: "아이디 또는 비밀번호가 일치하지 않습니다.",
      });
    }

    const accessToken = createAccessToken(user);
    const { token: refreshToken, expiresAt: refreshExpiresAt } =
      createRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: refreshExpiresAt,
      },
    });

    await prisma.loginLog.create({
      data: {
        userId: user.id,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
      },
    });

    return res.status(200).json({
      message: "로그인 성공",
      token: accessToken,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nickname: user.nickname,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        created_at: user.createdAt,
      },
    });
  } catch (err) {
    console.error("로그인 에러 : ", err.message);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "서버 에러",
    });
  }
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body || {};

  if (!refreshToken || typeof refreshToken !== "string") {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "refreshToken이 필요합니다.",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    if (!decoded?.id || decoded?.type !== "refresh") {
      return sendError(res, {
        status: 401,
        code: ERROR_CODES.AUTH_REFRESH_INVALID,
        message: "유효하지 않은 refresh token 입니다.",
      });
    }

    const currentHash = hashToken(refreshToken);
    const current = await prisma.refreshToken.findFirst({
      where: {
        userId: decoded.id,
        tokenHash: currentHash,
      },
    });

    if (!current || current.revokedAt || current.expiresAt < new Date()) {
      return sendError(res, {
        status: 401,
        code: ERROR_CODES.AUTH_REFRESH_INVALID,
        message: "만료되었거나 폐기된 refresh token 입니다.",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
        isDeleted: false,
      },
    });

    if (!user) {
      return sendError(res, {
        status: 401,
        code: ERROR_CODES.AUTH_REFRESH_INVALID,
        message: "사용자 세션이 유효하지 않습니다.",
      });
    }

    const nextAccessToken = createAccessToken(user);
    const { token: nextRefreshToken, expiresAt: nextRefreshExpiresAt } =
      createRefreshToken(user);

    const nextRefreshId = uuidv4();

    await prisma.$transaction([
      prisma.refreshToken.create({
        data: {
          id: nextRefreshId,
          userId: user.id,
          tokenHash: hashToken(nextRefreshToken),
          expiresAt: nextRefreshExpiresAt,
        },
      }),
      prisma.refreshToken.update({
        where: { id: current.id },
        data: {
          revokedAt: new Date(),
          replacedByTokenId: nextRefreshId,
        },
      }),
    ]);

    return res.status(200).json({
      message: "토큰이 재발급되었습니다.",
      token: nextAccessToken,
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
    });
  } catch (err) {
    return sendError(res, {
      status: 401,
      code: ERROR_CODES.AUTH_REFRESH_INVALID,
      message: "유효하지 않은 refresh token 입니다.",
    });
  }
};

export const logout = async (req, res) => {
  const { refreshToken } = req.body || {};

  if (!refreshToken || typeof refreshToken !== "string") {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "refreshToken이 필요합니다.",
    });
  }

  try {
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return res.status(200).json({ message: "로그아웃되었습니다." });
  } catch (err) {
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "로그아웃 처리에 실패했습니다.",
    });
  }
};

export const logoutAll = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendError(res, {
      status: 401,
      code: ERROR_CODES.AUTH_UNAUTHORIZED,
      message: "인증 정보가 없습니다.",
    });
  }

  try {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return res
      .status(200)
      .json({ message: "모든 기기에서 로그아웃되었습니다." });
  } catch (err) {
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "전체 로그아웃 처리에 실패했습니다.",
    });
  }
};

export const reactivateAccount = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: " 이메일이 필요합니다.",
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, {
        status: 404,
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: "존재하지 않는 이메일입니다.",
      });
    }

    if (!user.isDeleted) {
      return sendError(res, {
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "이미 활성화된 계정입니다.",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isDeleted: false, deletedAt: null },
    });

    return res.status(200).json({ message: "재가입이 완료되었습니다." });
  } catch (err) {
    console.error("재가입 처리 오류:", err);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "서버 오류로 재가입에 실패했습니다.",
    });
  }
};
