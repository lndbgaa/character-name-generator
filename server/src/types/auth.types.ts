import type { JwtPayload } from "jsonwebtoken";

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
