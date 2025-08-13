import { sequelize } from "@/database/mysql.js";
import { RefreshToken, User } from "@/models/index.js";
import CustomError from "@/utils/CustomError.utils.js";
import { generateAccessToken, generateRefreshToken } from "@/utils/auth-token.utils.js";

import type { AuthResult, LoginUserData, RegisterUserData } from "@/types/auth.types.js";

export default class AuthService {
  /**
   *
   * @param email
   */
  public static async assertEmailIsUnique(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();

    const exists = await User.findOne({ where: { email: cleanEmail } });

    if (exists)
      throw new CustomError({
        statusCode: 409,
        message: "An account with this email already exists.",
      });
  }

  /**
   *
   * @param username
   */
  public static async assertUsernameIsUnique(username: string): Promise<void> {
    const cleanUsername = username.trim().toLowerCase();

    const exists = await User.findOne({ where: { username: cleanUsername } });

    if (exists)
      throw new CustomError({
        statusCode: 409,
        message: "This username is already taken.",
      });
  }

  /**
   * Registers a new user and issues authentication tokens.

   * @param {RegisterUserData} data - Object containing user registration details.
   * @returns {Promise<AuthResult>} An object containing the access and refresh tokens.
   * @throws {CustomError} If the email or username is already taken.
   */
  public static async registerUser(data: RegisterUserData): Promise<AuthResult> {
    const { email, username, password, firstName, lastName } = data;

    await this.assertEmailIsUnique(email);
    await this.assertUsernameIsUnique(username);

    const { newUser, refreshToken } = await sequelize.transaction(async (transaction) => {
      const newUser = await User.create(
        {
          email,
          username,
          password,
          first_name: firstName,
          last_name: lastName,
        },
        { transaction }
      );

      const refreshToken = await generateRefreshToken(newUser.id, { transaction });

      return {
        newUser,
        refreshToken: refreshToken.token,
      };
    });

    const accessToken = generateAccessToken(newUser.id, "user");

    return {
      refreshToken,
      accessToken,
    };
  }

  /**
   * Authenticates a user and issues new authentication tokens.
   *
   * @param {LoginUserData} data - Object containing user login credentials.
   * @returns {Promise<AuthResult>} An object containing the access and refresh tokens.
   * @throws {CustomError} - If the credentials are incorrect.
   */
  public static async loginUser(data: LoginUserData): Promise<AuthResult> {
    const { email, password } = data;

    const user = await User.findOne({
      where: { email },
      include: [{ association: "role" }],
    });

    if (!user || !(await user.checkPassword(password))) {
      throw new CustomError({
        statusCode: 401,
        message: "Incorrect email or password.",
      });
    }

    return await sequelize.transaction(async (transaction) => {
      const userId = user.id;
      const userRole = user.role?.label || "user";

      user.updateLastLogin({ transaction });

      const refreshToken = await generateRefreshToken(userId, { transaction });
      const accessToken = generateAccessToken(userId, userRole);

      return {
        accessToken,
        refreshToken: refreshToken.token,
      };
    });
  }

  /**
   * Logs out a user by invalidating their refresh token.
   *
   * @param {string} refreshToken - The refresh token to invalidate.
   */
  public static async logoutUser(refreshToken: string): Promise<void> {
    const tokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken },
    });

    if (tokenRecord) await tokenRecord.markAsRevoked();
  }

  /**
   * Rotates the refresh token and issues a new access token.
   *
   * @param {string} refreshToken - The refresh token from the client (usually from a cookie).
   * @returns {Promise<AuthResult>} An object containing the new access and refresh tokens.
   * @throws {CustomError} - If the token is invalid or the user is not found/active.
   */
  public static async refreshUserAccessToken(refreshToken: string): Promise<AuthResult> {
    const tokenRecord = await RefreshToken.findOne({ where: { token: refreshToken } });

    if (!tokenRecord || !tokenRecord.isValid()) {
      throw new CustomError({
        statusCode: 403,
        message: "Your session has expired. Please log in again.",
        debugMessage: "Refresh token not found in DB or marked as revoked/expired.",
      });
    }

    const userId = tokenRecord.user_id;

    const user = await User.findOne({
      where: { id: userId },
      include: [{ association: "role" }],
    });

    if (!user || !user.isActive) {
      throw new CustomError({
        statusCode: 403,
        message: "We could not renew your session. Please log in again.",
        debugMessage: `User not found or inactive. Possibly suspended or soft-deleted.`,
        details: { userId },
      });
    }

    const newRefreshToken = await sequelize.transaction(async (transaction): Promise<RefreshToken> => {
      tokenRecord.markAsRevoked({ transaction });

      return await generateRefreshToken(userId, { transaction });
    });

    const userRole = user.role?.label || "user";

    const newAccessToken = generateAccessToken(userId, userRole);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken.token,
    };
  }
}
