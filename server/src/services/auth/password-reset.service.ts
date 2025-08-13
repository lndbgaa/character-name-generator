import dayjs from "dayjs";

import config from "@/config/app.config.js";
import { sequelize } from "@/database/mysql.js";
import { PasswordResetToken, User } from "@/models/index.js";
import { generateResetPasswordToken } from "@/utils/auth-token.utils.js";
import CustomError from "@/utils/CustomError.utils.js";
import renderTemplate from "@/utils/render-template.utils.js";
import sendEmail from "@/utils/send-email.utils.js";

const { clientUrl } = config;

class PasswordResetService {
  /**
   * Generates a password reset link for a user and sends it by email.
   *
   * @param {string} email - The email address of the user requesting the reset.
   * @returns {Promise<void>} Resolves silently, even if the email does not exist (to avoid account enumeration).
   * @throws {Error} If email sending fails (token is cleaned up in this case).
   */
  public static async sendPasswordResetLink(email: string): Promise<void> {
    const user = await User.findOne({
      where: { email },
      include: [{ association: "role" }],
    });

    const isRestrictedRole = ["admin"].includes(user?.role?.label ?? "");

    if (!user || isRestrictedRole) return; // ??? log

    const userId = user.id;
    const now = dayjs();
    const nowDate = now.toDate();

    const token = await sequelize.transaction(async (transaction): Promise<string> => {
      await PasswordResetToken.update(
        { status: "used", used_at: nowDate },
        {
          where: {
            user_id: userId,
            status: "active",
          },
          transaction,
        }
      );

      const newTokenRecord = await generateResetPasswordToken(userId, transaction);

      return newTokenRecord.token;
    });

    const resetLink = `${clientUrl}/reset-password?token=${token}`;

    const emailContent = await renderTemplate("passwordReset.html", {
      firstName: user.first_name || "",
      resetLink,
    });

    try {
      await sendEmail(user.email, "Reset Your Password", emailContent);
    } catch (err) {
      await PasswordResetToken.destroy({ where: { token } });

      throw err;
    }
  }

  /**
   * Retrieves and validates a password reset token.
   *
   * @private
   * @param {string} token - The reset token to validate.
   * @returns {Promise<PasswordResetToken>} The valid token record.
   * @throws {CustomError} If the token is missing, expired, or already used.
   */
  private static async getValidTokenRecord(token: string): Promise<PasswordResetToken> {
    const tokenRecord = await PasswordResetToken.findOne({ where: { token } });

    if (!tokenRecord || !tokenRecord.isValid()) {
      throw new CustomError({
        statusCode: 403,
        message: "Invalid or expired password reset link.",
        debugMessage: "Password reset token is missing, already used or has expired.",
      });
    }

    return tokenRecord;
  }

  /**
   * Validates if a password reset token is still valid.
   *
   * @param {string} token - The reset token to verify.
   * @returns {Promise<void>} Resolves if valid, otherwise throws an error.
   * @throws {CustomError} If the token is invalid.
   */
  public static async verifyPasswordResetToken(token: string): Promise<void> {
    await this.getValidTokenRecord(token);
  }

  /**
   * Resets a user's password using a valid reset token.
   *
   * @param {string} resetToken - The password reset token.
   * @param {string} newPassword - The new password to set for the user.
   * @returns {Promise<void>} Resolves when the password has been successfully updated.
   * @throws {CustomError} If the token is invalid or expired.
   */
  public static async resetUserPassword(resetToken: string, newPassword: string): Promise<void> {
    const tokenRecord = await this.getValidTokenRecord(resetToken);

    const now = dayjs();

    await sequelize.transaction(async (transaction) => {
      await tokenRecord.user!.updatePassword(newPassword, { transaction });

      await tokenRecord.update({ status: "used", used_at: now }, { transaction });
    });
  }
}

export default PasswordResetService;
