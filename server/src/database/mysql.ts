import { Sequelize } from "sequelize";

import config from "@/config/app.config.js";

interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

const { env } = config;
const { mysql }: { mysql: MySQLConfig } = config;
const { database, user, password, host, port } = mysql;

const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: "mysql",
  logging: env === "production" ? false : console.log,
});

const connectMySQL = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL: Connection successful");
  } catch (err) {
    console.error("❌ MySQL error:", err);
    throw new Error(`❌ Failed to connect to MySQL: ${(err as Error).message}`);
  }
};

export { connectMySQL, sequelize };
