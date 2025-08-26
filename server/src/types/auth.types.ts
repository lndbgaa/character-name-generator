import {
  AUTH_REFRESH_TOKEN_STATUSES,
  PWD_RESET_TOKEN_STATUSES,
} from "@/constants/token.constants.js";

import type { JwtPayload } from "jsonwebtoken";

/* ===========================
 *    Constants-based Types
 * =========================== */

export type AuthRefreshTokenStatus =
  (typeof AUTH_REFRESH_TOKEN_STATUSES)[keyof typeof AUTH_REFRESH_TOKEN_STATUSES];

export type PwdResetTokenStatus =
  (typeof PWD_RESET_TOKEN_STATUSES)[keyof typeof PWD_RESET_TOKEN_STATUSES];

/* ===========================
 *     Payloads & Results
 * =========================== */

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: string;
}

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
}
