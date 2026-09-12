import { Router } from "express";
import { getPackagesHandler } from "../controllers/packageController.js";

const router = Router();
router.get("/", getPackagesHandler);

export default router;
