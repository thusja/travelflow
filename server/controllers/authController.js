import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import db from "../db/index.js";
import { use } from "react";

// 회원가입 - 순수 저장만
export const signup = async (req, res) => {
  console.log('📥 받은 요청 바디:', req.body);
  const { name, email, password, phone } = req.body;

  try {
    // 중복 이메일 검사
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if(rows.length > 0) {
      return res.status(400).json({ message: "이미 사용 중인 이메일 입니다."})
    }

    // 비밀번호 암호화
    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();

    // db에 삽입
    await db.query (
      `INSERT INTO users (id, name, email, password, phone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, name, email, hashed, phone]
    );

    return res.status(201).json({ message: "회원가입 성공", userId: id});
  }
  catch(err) {
    console.error("회원가입 에러 : ", err);
    res.status(500).json({ message: "서버 에러"});
  }
};

// 로그인 - jwt 발급
export const login = async (req, res) => {
  const { email, password} = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if(rows.length === 0) {
      return res.status(401).json({ message: "존재하지 않는 이메일입니다."});
    } 

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if(!passwordMatch) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다."});
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email},
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "id"}
    );

    return res.status(200).json({
      message: "로그인 성공",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  }
  catch(err) {
    console.error("로그인 에러 : ", err.message);
    res.status(500).json({ message: "서버 에러" });
  }
};