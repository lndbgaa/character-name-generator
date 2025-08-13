import dayjs from "dayjs";
import ms from "ms";
import { nanoid } from "nanoid";

import config from "@/config/app.config.js";
import { PasswordResetToken, RefreshToken } from "@/models/index.js";
import { generateJwt } from "@/utils/jwt.utils.js";

import type { AccountRoleLabel } from "@/types/users/user.types.js";
import type { CreateOptions } from "sequelize";

const { refreshExpiration, accessExpiration, accessSecret } = config.jwt;

/**
 * Generates a signed JWT access token for a user.
 *
 * @param {string} userId - The unique ID of the user.
 * @param {AccountRoleLabel} userRole - The role of the user (e.g., "admin", "user").
 * @returns {string} Signed JWT token.
 */
export function generateAccessToken(userId: string, userRole: AccountRoleLabel): string {
  return generateJwt({ id: userId, role: userRole }, accessSecret, accessExpiration);
}

/**
 * Generates and stores a refresh token for a user.
 *
 * @param {string} userId - The unique ID of the user.
 * @param {CreateOptions} [options] - Additional Sequelize create options (e.g., includes).
 * @returns {Promise<RefreshToken>} The `RefreshToken` instance of the created refresh token.
 */
export function generateRefreshToken(userId: string, options?: CreateOptions): Promise<RefreshToken> {
  const now = dayjs();

  return RefreshToken.create(
    {
      user_id: userId,
      token: nanoid(),
      expires_at: now.add(ms(refreshExpiration), "ms").toDate(),
    },
    options
  );
}

/**
 * Generates and stores a password reset token for a user.
 *
 * @param {string} userId - The unique ID of the user.
 * @param {CreateOptions} [options] - Additional Sequelize create options (e.g., includes).
 * @returns {Promise<PasswordResetToken>} The `PasswordResetToken` instance of the created password reset token.
 */
export function generateResetPasswordToken(
  userId: string,
  options?: CreateOptions
): Promise<PasswordResetToken> {
  const now = dayjs();

  return PasswordResetToken.create(
    {
      user_id: userId,
      token: nanoid(32),
      expires_at: now.add(1, "hour").toDate(),
    },
    options
  );
}
