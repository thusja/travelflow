import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  createListMeta,
  hasListQuery,
  parsePageSize,
  parseSort,
} from "../utils/listQuery.js";

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const packagesFilePath = path.join(__dirname, "../data/packages.json");
const packages = JSON.parse(fs.readFileSync(packagesFilePath, "utf-8"));

router.get("/", (req, res) => {
  const { filter = "", sort } = req.query;
  const { page, size, skip, take } = parsePageSize(req.query);
  const sortInfo = parseSort(sort, ["id", "title", "price"], {
    key: "id",
    direction: "asc",
  });

  let items = [...packages];

  if (filter && typeof filter === "string") {
    const needle = filter.toLowerCase();
    items = items.filter(
      (pkg) =>
        pkg.title?.toLowerCase().includes(needle) ||
        pkg.description?.toLowerCase().includes(needle),
    );
  }

  items.sort((a, b) => {
    const left = a[sortInfo.key];
    const right = b[sortInfo.key];

    if (typeof left === "string" && typeof right === "string") {
      return sortInfo.direction === "asc"
        ? left.localeCompare(right, "ko")
        : right.localeCompare(left, "ko");
    }

    return sortInfo.direction === "asc" ? left - right : right - left;
  });

  const total = items.length;
  const paged = items.slice(skip, skip + take);

  if (hasListQuery(req.query)) {
    return res.json({
      items: paged,
      meta: createListMeta({ page, size, total }),
    });
  }

  res.json(paged);
});

export default router;
