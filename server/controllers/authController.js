import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import db from "../db/index.js";

// 회원가입 - 순수 저장만
export const signup = async (req, res) => {
  const { nickname, firstname, lastname, email, password, phone } = req.body;

  try {
    // 중복 이메일 검사
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "이미 사용 중인 이메일 입니다." });
    }

    // 비밀번호 암호화
    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();

    // db에 삽입
    await db.query(
      `INSERT INTO users (id, nickname, firstname, lastname, email, password, phone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, nickname, firstname, lastname, email, hashed, phone]
    );

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
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

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
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    console.error("로그인 에러 : ", err.message);
    res.status(500).json({ message: "서버 에러" });
  }
};
