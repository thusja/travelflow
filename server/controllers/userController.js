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
