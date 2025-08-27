import dayjs from "dayjs";
import { DataTypes, Model } from "sequelize";

import { EMAIL_VERIFICATION_TOKEN_STATUSES } from "@/constants/token.constants.js";

import { sequelize } from "@/database/mysql.database.js";
import CustomError from "@/utils/CustomError.utils.js";

import type User from "@/models/User.model.js";
import type { EmailVerificationTokenStatus } from "@/types/auth.types.js";
import type { SaveOptions } from "sequelize";

const { ACTIVE, USED, EXPIRED } = EMAIL_VERIFICATION_TOKEN_STATUSES;

/**
 * The `EmailVerificationToken` entity represents a one-time token
 * generated when a new user registers or requests email confirmation.
 * It is used to verify ownership of the email address.
 *
 * Fields:
 * - `user_id`: Foreign key referencing the user who owns the token.
 * - `token`: Secure unique string used for verification.
 * - `status`: Current status of the token ("active", "used", "expired").
 * - `expires_at`: Expiration timestamp (token is invalid after this point).
 * - `used_at`: Timestamp of when the token was explicitly used (nullable).
 * - `created_at`: Automatic creation timestamp.
 */
export default class EmailVerificationToken extends Model {
  declare id: string;
  declare user_id: string;
  declare token: string;
  declare status: EmailVerificationTokenStatus;
  declare created_at: Date;
  declare expires_at: Date;
  declare used_at: Date | null;

  declare user?: User;

  /**
   * Checks if the verification token is active and not expired.
   *
   * @returns {boolean} True if status is "active" and the expiration date is in the future.
   */
  public isValid(): boolean {
    return this.status === ACTIVE && dayjs().isBefore(this.expires_at);
  }

  /**
   * Marks the verification token as used.
   *
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<void>}
   */
  public async markAsUsed(options?: SaveOptions): Promise<void> {
    if (this.status !== ACTIVE) return;

    this.status = USED;
    this.used_at = dayjs().toDate();
    await this.save({ ...options, fields: ["status", "used_at"] });
  }
}

EmailVerificationToken.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    token: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(EMAIL_VERIFICATION_TOKEN_STATUSES)),
      allowNull: false,
      defaultValue: ACTIVE,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "EmailVerificationToken",
    tableName: "email_verification_tokens",
    timestamps: true,
    updatedAt: false,
    createdAt: "created_at",
  }
);

EmailVerificationToken.beforeCreate((token: EmailVerificationToken) => {
  const nowDate = dayjs().toDate();

  if (token.expires_at <= nowDate) {
    throw new CustomError({
      statusCode: 400,
      message: "`expires_at` must be in the future.",
    });
  }
});
