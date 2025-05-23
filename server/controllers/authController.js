import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import db from "../db/index.js";

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