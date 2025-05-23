import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const packagesFilePath = path.join(__dirname, "../data/packages.json");
const packages = JSON.parse(fs.readFileSync(packagesFilePath, "utf-8"));

router.get("/", (req, res) => {
  res.json(packages);
});

export default router;
