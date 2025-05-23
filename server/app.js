import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import packagesRouter from "./routes/packages.js";
import authRoutes from "./routes/auth.js";
<<<<<<< HEAD

dotenv.config();
=======
>>>>>>> e5412063fde660cda7f19e91922738fc2c599272

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/packages", packagesRouter);

app.use("/api/auth", authRoutes);

app.post("/test", (req, res) => {
  console.log("✅ test route req.body:", req.body);
  res.json({ received: req.body });
});

app.listen(PORT, () => {
  console.log(`✅ Express server is running on http://localhost:${PORT}`);
});
