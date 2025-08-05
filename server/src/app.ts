import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(customParseFormat);

import cookieParser from "cookie-parser";
import express from "express";

import config from "@/config/app.config.js";
import connectMongo from "@/database/mongo.js";
import { connectMySQL } from "@/database/mysql.js";
import errorHandler from "@/middlewares/errorHandler.js";
import mainRouter from "@/routes/index.js";
import CustomError from "@/utils/CustomError.js";

const app = express();
const PORT = config.port;

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ status: "Server is up and running!" });
});

app.use("/api/v1", mainRouter);

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
