import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import prisma from "../db/index.js";

// 회원가입 - 순수 저장만
export const signup = async (req, res) => {
  const { nickname, firstname, lastname, email, password, phone } = req.body;
  const defaultProfilePath = "/uploads/profile/default-profile.png";

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "이미 사용 중인 이메일 입니다." });
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
    res.status(500).json({ message: "서버 에러" });
  }
};

// 로그인 - JWT 발급
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
    }

    if (user.isDeleted) {
      return res.status(403).json({
        message: "해당 계정은 탈퇴 처리된 상태입니다. 재가입 후 이용해주세요.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
    }

    // JWT 발급
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );

    await prisma.loginLog.create({
      data: {
        userId: user.id,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
      },
    });

    return res.status(200).json({
      message: "로그인 성공",
      token,
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
    res.status(500).json({ message: "서버 에러" });
  }
};

export const reactivateAccount = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ message: " 이메일이 필요합니다." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "존재하지 않는 이메일입니다." });
    }

    if (!user.isDeleted) {
      return res.status(400).json({ message: "이미 활성화된 계정입니다." });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isDeleted: false, deletedAt: null },
    });

    return res.status(200).json({ message: "재가입이 완료되었습니다." });
  } catch (err) {
    console.error("재가입 처리 오류:", err);
    return res
      .status(500)
      .json({ message: "서버 오류로 재가입에 실패했습니다." });
  }
};
