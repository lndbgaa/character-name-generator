import dayjs from "dayjs";
import ms from "ms";
import { nanoid } from "nanoid";

import config from "@/config/app.config.js";
import { PasswordResetToken, RefreshToken } from "@/models/index.js";
import { generateJwt } from "@/utils/jwt.utils.js";

import type { Transaction } from "sequelize";

const { refreshExpiration, accessExpiration, accessSecret } = config.jwt;

/**
 *
 * @param userId
 * @param userRole
 * @returns
 */
export function generateAccessToken(userId: string, userRole: string): string {
  return generateJwt({ id: userId, role: userRole }, accessSecret, accessExpiration);
}

/**
 *
 * @param userId
 * @param transaction
 * @returns
 */
export function generateRefreshToken(userId: string, transaction?: Transaction): Promise<RefreshToken> {
  const now = dayjs();

  return RefreshToken.create(
    {
      user_id: userId,
      token: nanoid(),
      expires_at: now.add(ms(refreshExpiration), "ms").toDate(),
    },
    { transaction }
  );
}

/**
 *
 * @param userId
 * @returns
 */
export function generateResetPasswordToken(
  userId: string,
  transaction?: Transaction
): Promise<PasswordResetToken> {
  const now = dayjs();

  return PasswordResetToken.create(
    {
      user_id: userId,
      token: nanoid(32),
      expires_at: now.add(1, "hour").toDate(),
    },
    { transaction }
  );
}
