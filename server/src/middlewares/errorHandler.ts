import config from "@/config/app.config.js";
import CustomError from "@/utils/CustomError.js";
import logError from "@/utils/logError.js";

import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again later.";

const { env } = config;
const isDev = env === "development";

const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof CustomError) {
    const { statusCode, statusText, message, isPublic, code, details, stack } = err;

    logError({ statusCode, statusText, message, stack, code, details });

    res.status(statusCode).json({
      success: false,
      statusCode,
      statusText,
      code,
      message: isDev || isPublic ? message : GENERIC_ERROR_MESSAGE,
      details: isDev ? details : undefined,
    });
  } else {
    const statusCode = 500;
    const statusText = "Internal Server Error";
    const message = err.message || GENERIC_ERROR_MESSAGE;
    const stack = err.stack ?? null;

    logError({ statusCode, statusText, message, stack });

    res.status(statusCode).json({
      success: false,
      statusCode,
      statusText,
      message: isDev ? message : GENERIC_ERROR_MESSAGE,
    });
  }
};

export default errorHandler;
