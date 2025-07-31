import ms from "ms";

import config from "@/config/app.config.js";
import AuthService from "@/services/auth.service.js";
import catchAsync from "@/utils/catchAsync.js";

import CustomError from "@/utils/CustomError.js";

import type { LoginUserData, RegisterUserData } from "@/types/auth.d.ts";
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
 * - Extracts user data from the request body.
 * - Calls AuthService to create the user and generate tokens.
 * - Sets the refresh token in an HttpOnly cookie.
 * - Returns the access token in the response.
 */
export const registerUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: RegisterUserData = req.body;

  const { accessToken, refreshToken } = await AuthService.registerUser(data);

  res.cookie("refreshToken", refreshToken, generateCookieOptions());

  return res.status(201).json({
    success: true,
    message: "🎉 Welcome aboard! Your account has been created successfully.",
    data: { accessToken },
  });
});

/**
 * Authenticates a user and starts a session.
 * - Extracts login credentials from the request body.
 * - Calls AuthService to validate credentials and generate tokens.
 * - Sets the refresh token in an HttpOnly cookie.
 * - Returns the access token in the response.
 */
export const loginUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: LoginUserData = req.body;

  const { accessToken, refreshToken } = await AuthService.loginUser(data);

  res.cookie("refreshToken", refreshToken, generateCookieOptions());

  return res.status(200).json({
    success: true,
    message: "👋 Welcome back!",
    data: { accessToken },
  });
});

/**
 * Logs out the user and ends the session.
 * - Retrieves the refresh token from cookies.
 * - Calls AuthService to invalidate the token on the server side.
 * - Clears the refresh token cookie.
 * - Returns a confirmation response.
 */
export const logoutUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const refreshToken = req.cookies.refreshToken;

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
 * Refreshes the access token using a valid refresh token.
 * - Retrieves the refresh token from cookies.
 * - Calls AuthService to validate and rotate the refresh token.
 * - Sets the new refresh token in an HttpOnly cookie.
 * - Returns a new access token in the response.
 * - If the refresh token is missing or invalid, clears the cookie and throws an error.
 */
export const refreshUserAccessToken = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new CustomError({
        statusCode: 401,
        message: "You are not logged in. Please log in again.",
        debugMessage: "No session token (refresh token) found in cookies.",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await AuthService.refreshUserAccessToken(refreshToken);

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
