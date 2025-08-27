import {
  EMAIL_VERIFICATION_TOKEN_STATUSES,
  PASSWORD_RESET_TOKEN_STATUSES,
  REFRESH_TOKEN_STATUSES,
} from "@/constants/token.constants.js";

import type { JwtPayload } from "jsonwebtoken";

/* ===========================
 *    Constants-based Types
 * =========================== */

export type EmailVerificationTokenStatus =
  (typeof EMAIL_VERIFICATION_TOKEN_STATUSES)[keyof typeof EMAIL_VERIFICATION_TOKEN_STATUSES];

export type RefreshTokenStatus = (typeof REFRESH_TOKEN_STATUSES)[keyof typeof REFRESH_TOKEN_STATUSES];

export type PasswordResetTokenStatus =
  (typeof PASSWORD_RESET_TOKEN_STATUSES)[keyof typeof PASSWORD_RESET_TOKEN_STATUSES];

/* ===========================
 *     Payloads & Results
 * =========================== */

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: string;
}

export interface RegisterUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export interface LoginUserPayload {
  email: string;
  password: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
}

export interface ResetUserPasswordPayload {
  token: string;
  password: string;
}
