import config from "@/config/app.config.js";
import CustomError from "@/utils/CustomError.utils.js";
import { verifyJwt } from "@/utils/jwt.utils.js";

import type { NextFunction, Request, Response } from "express";

const { accessSecret } = config.jwt;

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new CustomError({
        statusCode: 401,
        message: "You must be logged in to access this resource.",
        debugMessage: "Missing or malformed authorization header.",
        details: {
          path: req.originalUrl,
          method: req.method,
        },
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt(token, accessSecret);

    req.user = decoded;

    next();
  } catch (err) {
    next(err);
  }
};

export default requireAuth;
