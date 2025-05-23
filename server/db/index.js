import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "thus97",
  database: "travel_flow",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
