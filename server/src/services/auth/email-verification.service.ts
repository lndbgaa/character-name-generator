import dayjs from "dayjs";

import config from "@/config/app.config.js";
import { sequelize } from "@/database/mysql.database.js";
import EmailVerificationToken from "@/models/EmailVerificationToken.model.js";
import User from "@/models/User.model.js";
import UserService from "@/services/users/users.service.js";
import { generateEmailVerificationToken } from "@/utils/auth-token.utils.js";
import CustomError from "@/utils/CustomError.utils.js";
import renderTemplate from "@/utils/render-template.utils.js";
import sendEmail from "@/utils/send-email.utils.js";

const { clientUrl } = config;

class EmailVerificationService {
  /**
   * Sends a verification email link for the given user.
   *
   * Typically called right after user registration,
   * when the full `User` entity is already available.
   *
   * @param {User} user - The user instance to send the verification email to.
   * @returns {Promise<void>}
   * @throws {CustomError} If:
   *  - The user's email is already verified (400 Bad Request).
   *  - Sending the email fails (500 Internal Server Error).
   */
  public static async sendForUser(user: User): Promise<void> {
    if (user.is_verified) {
      throw new CustomError({
        statusCode: 400,
        message: "This account has already been verified.",
      });
    }

    const nowDate = dayjs().toDate();

    const token = await sequelize.transaction(async (transaction) => {
      await EmailVerificationToken.update(
        { status: "used", used_at: nowDate },
        { where: { user_id: user.id, status: "active" }, transaction }
      );

      const newTokenRecord = await generateEmailVerificationToken(user.id, { transaction });
      return newTokenRecord.token;
    });

    const verifyEmailLink = `${clientUrl}/verify-email?token=${token}`;

    const emailContent = await renderTemplate("emailVerification.html", {
      firstName: user.first_name || "",
      verifyLink: verifyEmailLink,
    });

    try {
      await sendEmail(user.email, "Verify Your Email Address", emailContent);
    } catch (err) {
      await EmailVerificationToken.destroy({ where: { token } });
      // FIXME: use proper logger
      console.error("Email verification failed:", err);

      throw new CustomError({
        statusCode: 500,
        message: "Failed to send verification email. Please try again later.",
        debugMessage: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Sends a verification email link to the given email address.
   *
   * Typically called when resending a verification email,
   * when only the email address is provided.
   *
   * @param {string} email - The user's email address.
   * @returns {Promise<void>}
   * @throws {CustomError} If:
   *  - The user's email is already verified (400 Bad Request).
   *  - Sending the email fails (500 Internal Server Error).
   */
  public static async send(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });
    if (!user) return;
    return this.sendForUser(user);
  }

  /**
   * Verifies a user's email address using a verification token.
   *
   * @param {string} token - The verification token provided by the user.
   * @returns {Promise<void>}
   * @throws {CustomError} If the token is invalid, expired, or has already been used.
   */
  public static async verify(token: string): Promise<void> {
    const tokenRecord = await EmailVerificationToken.findOne({ where: { token } });

    if (!tokenRecord || !tokenRecord.isValid()) {
      throw new CustomError({
        statusCode: 403,
        message: "Invalid or expired email verification link.",
        debugMessage: "Email verification token is missing, already used or has expired.",
      });
    }

    const user = await UserService.findUserById(tokenRecord.user_id);

    await sequelize.transaction(async (transaction) => {
      await tokenRecord.markAsUsed({ transaction });
      await user.markAsVerified({ transaction });
    });
  }
}

export default EmailVerificationService;
