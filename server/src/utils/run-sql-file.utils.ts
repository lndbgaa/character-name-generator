import fs from "fs";
import mysql from "mysql2/promise";

import config from "@/config/app.config.js";

import type { MySQLConfig } from "@/types/config.types.js";

const { mysql: mysqlConfig }: { mysql: MySQLConfig } = config;
const { user, host, password, database } = mysqlConfig;

/**
 * Executes a SQL script from a file against the configured MySQL database.
 *
 * @param {string} filePath - Absolute path to the SQL file.
 * @returns {Promise<void>}
 * @throws {Error} If the file is missing or execution fails.
 */
const runSQLFile = async (filePath: string): Promise<void> => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`⚠️  File not found: ${filePath}`);
  }

  const connection = await mysql.createConnection({
    host,
    user,
    password,
    database,
    multipleStatements: true,
  });

  const sql = fs.readFileSync(filePath, "utf8");

  try {
    await connection.query(sql);
    console.log(`✅ SQL script executed successfully:\n→ ${filePath}`);
  } catch (err) {
    throw new Error(`⚠️  Error in file: ${filePath} → ${(err as Error).message}`);
  } finally {
    await connection.end();
  }
};

export default runSQLFile;
