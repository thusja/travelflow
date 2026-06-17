import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const isReadQuery = (sql) => /^(\s*)(select|with)\b/i.test(sql);

const toPgPlaceholders = (sql) => {
  let index = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  let converted = "";
  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];

    if (char === "'" && !inDoubleQuote) {
      const isEscaped = i > 0 && sql[i - 1] === "\\";
      if (!isEscaped) {
        inSingleQuote = !inSingleQuote;
      }
      converted += char;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      const isEscaped = i > 0 && sql[i - 1] === "\\";
      if (!isEscaped) {
        inDoubleQuote = !inDoubleQuote;
      }
      converted += char;
      continue;
    }

    if (char === "?" && !inSingleQuote && !inDoubleQuote) {
      index += 1;
      converted += `$${index}`;
      continue;
    }

    converted += char;
  }

  return converted;
};

const db = {
  async query(sql, params = []) {
    const normalizedSql = toPgPlaceholders(sql);

    if (isReadQuery(normalizedSql)) {
      const rows = await prisma.$queryRawUnsafe(normalizedSql, ...params);
      return [rows, undefined];
    }

    const affectedRows = await prisma.$executeRawUnsafe(
      normalizedSql,
      ...params,
    );
    return [{ affectedRows }, undefined];
  },

  prisma,
};

export default db;
