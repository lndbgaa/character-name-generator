import jwt from "jsonwebtoken";

import CustomError from "@/utils/CustomError.utils.js";

import type { CustomJwtPayload } from "@/types/auth.types.js";
import type { StringValue } from "ms";

/**
 * Generates a signed JSON Web Token (JWT) with the given payload.
 *
 * @param {CustomJwtPayload} payload - Data to embed in the token.
 * @param {string} secret - Secret key used for signing.
 * @param {StringValue|number} expiresIn - Expiration time (e.g., "1h" or seconds).
 * @returns {string} The signed JWT.
 */
export function generateJwt(
  payload: CustomJwtPayload,
  secret: string,
  expiresIn: StringValue | number
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verifies and decodes a JSON Web Token (JWT).
 *
 * @param {string} token - The token to verify.
 * @param {string} secret - Secret key used for verification.
 * @returns {CustomJwtPayload} The decoded payload.
 * @throws {CustomError} If the token is expired, invalid, or malformed.
 */
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
    if (err instanceof jwt.TokenExpiredError) {
      throw new CustomError({
        statusCode: 401,
        message: "Expired token.",
        code: "TOKEN_EXPIRED",
      });
    }

    if (err instanceof jwt.JsonWebTokenError) {
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
