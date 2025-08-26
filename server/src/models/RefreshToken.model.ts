import dayjs from "dayjs";
import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.database.js";
import CustomError from "@/utils/CustomError.utils.js";

import type { User } from "@/models/index.js";
import type { AuthRefreshTokenStatus } from "@/types/auth.types.js";
import type { SaveOptions } from "sequelize";

/**
 * The `RefreshToken` entity represents a long-lived authentication token
 * used to renew access tokens without requiring the user to log in again.
 *
 * Fields:
 * - `user_id`: Foreign key referencing the user who owns the token.
 * - `token`: Unique secure token string (stored server-side only).
 * - `status`: Current lifecycle state ("active", "revoked", "expired").
 * - `expires_at`: Expiration timestamp (token is invalid after this point).
 * - `revoked_at`: Timestamp of when the token was explicitly revoked (nullable).
 * - `created_at`: Automatic creation timestamp.
 * - `updated_at`: Automatic update timestamp.
 */
export default class RefreshToken extends Model {
  declare id: string;
  declare user_id: string;
  declare token: string;
  declare status: AuthRefreshTokenStatus;
  declare created_at: Date;
  declare updated_at: Date;
  declare expires_at: Date;
  declare revoked_at: Date | null;

  declare user?: User;

  /**
   * Checks if the refresh token is active and not expired.
   *
   * @returns {boolean} True if status is "active" and the expiration date is in the future.
   */
  public isValid(): boolean {
    return this.status === "active" && dayjs().isBefore(this.expires_at);
  }

  /**
   * Marks the refresh token as revoked.
   *
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<void>}
   */
  public async markAsRevoked(options?: SaveOptions): Promise<void> {
    if (this.status !== "active") return;

    this.status = "revoked";
    this.revoked_at = dayjs().toDate();
    await this.save({ ...options, fields: ["status", "revoked_at"] });
  }

  /**
   * Marks the refresh token as expired.
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

RefreshToken.init(
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
      type: DataTypes.STRING(21),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("active", "revoked", "expired"),
      allowNull: false,
      defaultValue: "active",
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "RefreshToken",
    tableName: "refresh_tokens",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "idx_refresh_status_expires",
        fields: ["status", "expires_at"],
      },
      {
        name: "idx_refresh_user_status",
        fields: ["user_id", "status"],
      },
    ],
  }
);

RefreshToken.beforeValidate((token: RefreshToken) => {
  if (token.expires_at <= token.created_at) {
    throw new CustomError({
      statusCode: 400,
      message: "`expires_at` must be after `created_at`.",
    });
  }
});
