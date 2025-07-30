import express from "express";

import config from "@/config/app.config.js";
import connectMongo from "@/database/mongo.js";
import { connectMySQL } from "@/database/mysql.js";
import errorHandler from "@/middlewares/errorHandler.js";
import CustomError from "@/utils/CustomError.js";

const app = express();
const PORT = config.port;

app.get("/", (req, res) => {
  res.json({ status: "Server is up and running!" });
});

app.use((req, res, next) => {
  next(
    new CustomError({
      statusCode: 404,
      message: "The requested resource was not found.",
      details: {
        path: req.originalUrl,
        method: req.method,
      },
    })
  );
});

app.use(errorHandler);

const start = async (): Promise<void> => {
  try {
    await Promise.all([connectMySQL(), connectMongo()]);

    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error(`Serveur startup error: ${(err as Error).message}`);
    process.exit(1);
  }
};

start();
