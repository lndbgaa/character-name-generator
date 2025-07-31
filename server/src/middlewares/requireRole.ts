import CustomError from "@/utils/CustomError.js";

import type { NextFunction, Request, Response } from "express";

const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role ?? "user";

    if (!allowedRoles.includes(userRole)) {
      return next(
        new CustomError({
          statusCode: 401,
          message: "You are not allowed to access this resource.",
          debugMessage: `User role "${userRole}" is not in allowed roles: [${allowedRoles.join(", ")}].`,
          details: {
            path: req.originalUrl,
            method: req.method,
          },
        })
      );
    }

    next();
  };
};

export default requireRole;
