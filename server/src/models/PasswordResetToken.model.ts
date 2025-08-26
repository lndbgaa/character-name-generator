import dayjs from "dayjs";
import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.database.js";
import CustomError from "@/utils/CustomError.utils.js";

import type { User } from "@/models/index.js";
import type { PwdResetTokenStatus } from "@/types/auth.types.js";
import type { SaveOptions } from "sequelize";

/**
 * The `PasswordResetToken` entity represents a time-limited token
 * used to allow a user to reset their password securely.
 *
 *  Fields:
 * - `user_id`: Foreign key referencing the user who requested the reset.
 * - `token`: Secure unique string used for verification.
 * - `status`: Current status of the token ("active", "used", "expired").
 * - `expires_at`: Expiration timestamp (token is invalid after this point).
 * - `used_at`: Timestamp of when the token was explicitly used (nullable).
 * - `created_at`: Automatic creation timestamp.
 * - `updated_at`: Automatic update timestamp.
 */
export default class PasswordResetToken extends Model {
  declare id: string;
  declare user_id: string;
  declare token: string;
  declare status: PwdResetTokenStatus;
  declare created_at: Date;
  declare updated_at: Date;
  declare expires_at: Date;
  declare used_at: Date | null;

  declare user?: User;

  /**
   * Checks if the reset token is active and not expired.
   *
   * @returns {boolean} True if status is "active" and the expiration date is in the future.
   */
  public isValid(): boolean {
    return this.status === "active" && dayjs().isBefore(this.expires_at);
  }

  /**
   * Marks the reset token as used.
   *
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<void>}
   */
  public async markAsUsed(options?: SaveOptions): Promise<void> {
    if (this.status !== "active") return;

    this.status = "used";
    this.used_at = dayjs().toDate();
    await this.save({ ...options, fields: ["status", "used_at"] });
  }

  /**
   * Marks the reset token as expired.
   *
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<void>}
   */
  public async markAsExpired(options?: SaveOptions): Promise<void> {
    if (this.status !== "active" || !dayjs().isAfter(this.expires_at)) return;

    this.status = "expired";
    await this.save({ ...options, fields: ["status"] });
  }
}

PasswordResetToken.init(
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
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("active", "used", "expired"),
      allowNull: false,
      defaultValue: "active",
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
    modelName: "PasswordResetToken",
    tableName: "password_reset_tokens",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "idx_reset_status_expires",
        fields: ["status", "expires_at"],
      },
      {
        name: "idx_reset_user_status",
        fields: ["user_id", "status"],
      },
    ],
  }
);

PasswordResetToken.beforeValidate((token: PasswordResetToken) => {
  if (token.expires_at <= token.created_at) {
    throw new CustomError({
      statusCode: 400,
      message: "`expires_at` must be after `created_at`.",
    });
  }
});
