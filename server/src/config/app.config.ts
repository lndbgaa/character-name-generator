import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import getEnvVar from "@/utils/getEnvVar.js";

import type { StringValue } from "ms";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const env = process.env.NODE_ENV ?? "development";
const envPath = path.resolve(process.cwd(), `.env.${env}`);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`✅ .env.${env} loaded`);
} else {
  dotenv.config();
  console.log(`⚠️ .env.${env} not found. Falling back to default .env file`);
}

const serverUrl = env === "production" ? getEnvVar("SERVER_URL") : "http://localhost:8080";
const clientUrl = env === "production" ? getEnvVar("CLIENT_URL") : "http://localhost:5173";

const config = {
  env,
  serverUrl,
  clientUrl,
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
  jwt: {
    accessSecret: getEnvVar("JWT_ACCESS_SECRET"),
    accessExpiration: (process.env.JWT_ACCESS_EXPIRATION as StringValue) ?? "10m",
    refreshExpiration: (process.env.JWT_REFRESH_EXPIRATION as StringValue) ?? "7d",
  },
  mysql: {
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    host: getEnvVar("MYSQL_HOST"),
    user: getEnvVar("MYSQL_USER"),
    password: getEnvVar("MYSQL_PWD"),
    database: getEnvVar("MYSQL_NAME"),
  },
  mongo: {
    uri: getEnvVar("MONGO_URI"),
    database: getEnvVar("MONGO_NAME"),
  },
  gmail: {
    user: getEnvVar("GMAIL_USER"),
    pass: getEnvVar("GMAIL_PASSWORD"),
  },
};

export default config;
