import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT ? Number(process.env.PORT) : 8080;

const config = {
  port,
};

export default config;
