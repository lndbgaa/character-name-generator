import jwt from "jsonwebtoken";

import CustomError from "@/utils/CustomError.js";

import type { CustomJwtPayload } from "@/types/auth.js";
import type { StringValue } from "ms";

const { JsonWebTokenError, TokenExpiredError } = jwt;

export function generateJwt(payload: CustomJwtPayload, secret: string, expiresIn: StringValue | number) {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyJwt(token: string, secret: string): CustomJwtPayload {
  try {
    const decoded = jwt.verify(token, secret);

    if (!decoded || typeof decoded !== "object" || !("id" in decoded) || !("role" in decoded)) {
      throw new CustomError({
        statusCode: 401,
        message: "Malformed token payload.",
        code: "TOKEN_MALFORMED",
      });
    }

    return decoded as CustomJwtPayload;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new CustomError({
        statusCode: 401,
        message: "Expired token.",
        code: "TOKEN_EXPIRED",
      });
    }

    if (err instanceof JsonWebTokenError) {
      throw new CustomError({
        statusCode: 401,
        message: "Invalid token.",
        code: "TOKEN_INVALID",
      });
    }

    throw new CustomError({
      statusCode: 500,
      message: "Could not verify access token.",
    });
  }
}
