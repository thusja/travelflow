import express from "express";
import cors from "cors";
import packagesRouter from "./routes/packages.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/packages", packagesRouter);

app.listen(PORT, () => {
  console.log(`✅ Express server is running on http://localhost:${PORT}`);
});
