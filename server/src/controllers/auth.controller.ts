import ms from "ms";

import config from "@/config/app.config.js";
import AuthService from "@/services/auth/auth.service.js";
import EmailVerificationService from "@/services/auth/email-verification.service.js";
import PasswordResetService from "@/services/auth/password-reset.service.js";
import catchAsync from "@/utils/catch-async.utils.js";
import CustomError from "@/utils/CustomError.utils.js";

import type { LoginUserPayload, RegisterUserPayload, ResetUserPasswordPayload } from "@/types/auth.types.js";
import type { CookieOptions, Request, Response } from "express";

const { env, jwt } = config;
const { refreshExpiration } = jwt;

function generateCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env === "production",
    sameSite: env === "production" ? "none" : "lax",
    path: "/",
    maxAge: ms(refreshExpiration),
  };
}

/**
 * Registers a new user account.
 */
export const registerUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: RegisterUserPayload = req.body;

  await AuthService.registerUser(data);

  return res.status(201).json({
    success: true,
    message: "🎉 Welcome aboard! Please check your email to verify your account before logging in.",
  });
});

/**
 * Verifies a user's email address.
 */
export const verifyEmail = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.body.token;

  await EmailVerificationService.verify(token);

  return res.status(200).json({
    success: true,
    message: "✅ Your email has been successfully verified. You can now log in.",
  });
});

/**
 * Resends the email verification link.
 */
export const resendVerificationEmail = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const email: string = req.body.email;

  await EmailVerificationService.send(email);

  return res.status(200).json({
    success: true,
    message: "📧 A new verification email has been sent. Please check your inbox.",
  });
});

/**
 * Authenticates a user and starts a session.
 */
export const loginUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: LoginUserPayload = req.body;

  const { accessToken, refreshToken } = await AuthService.loginUser(data);

  res.cookie("refreshToken", refreshToken, generateCookieOptions());

  return res.status(200).json({
    success: true,
    message: "👋 Welcome back!",
    data: { accessToken },
  });
});

/**
 * Refreshes the access token using a valid refresh token.
 */
export const refreshUserAccessToken = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const refreshToken: string = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new CustomError({
      statusCode: 401,
      message: "❌ You are not logged in. Please log in again.",
      debugMessage: "No session token (refresh token) found in cookies.",
    });
  }

  try {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await AuthService.refreshUserAccessToken(
      refreshToken
    );

    res.cookie("refreshToken", newRefreshToken, generateCookieOptions());

    return res.status(200).json({
      success: true,
      message: "✅ Your session has been successfully extended.",
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    res.clearCookie("refreshToken", generateCookieOptions());
    throw err;
  }
});

/**
 * Logs out the user and ends the session.
 */
export const logoutUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const refreshToken: string = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(200).json({
      success: true,
      message: "You're already logged out.",
    });
  }

  await AuthService.logoutUser(refreshToken);

  res.clearCookie("refreshToken", generateCookieOptions());

  return res.status(200).json({
    success: true,
    message: "👋 You’ve been logged out successfully. See you soon!",
  });
});

/**
 * Sends a password reset link to the user’s email address.
 */
export const requestPasswordReset = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const email: string = req.body.email;

  await PasswordResetService.sendPasswordResetLink(email);

  return res.status(200).json({
    success: true,
    message: "📧 If an account with this email exists, we have sent you a password reset link.",
  });
});

/**
 * Verifies if a password reset token is valid.
 */
export const verifyPasswordResetToken = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.body.token;

  await PasswordResetService.verifyPasswordResetToken(token);

  return res.status(200).json({
    success: true,
    message: "✅ Password reset token is valid.",
  });
});

/**
 * Resets the user’s password using a valid reset token.
 */
export const resetUserPassword = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: ResetUserPasswordPayload = req.body;

  await PasswordResetService.resetUserPassword(data);

  return res.status(200).json({
    success: true,
    message: "✅ Your password has been successfully reset.",
  });
});
