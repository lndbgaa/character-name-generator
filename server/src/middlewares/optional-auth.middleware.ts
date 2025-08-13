import config from "@/config/app.config.js";
import { verifyJwt } from "@/utils/jwt.utils.js";

import type { NextFunction, Request, Response } from "express";

const { accessSecret } = config.jwt;

const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt(token, accessSecret);

    req.user = decoded;
    return next();
  } catch (err: any) {
    if (err.code === "TOKEN_EXPIRED") {
      return next(err);
    }

    req.user = undefined;
    return next();
  }
};

export default optionalAuth;
