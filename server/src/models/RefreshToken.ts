import dayjs from "dayjs";
import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.js";

import type { User } from "@/models/index.js";
import type { SaveOptions } from "sequelize";

type RefreshTokenStatus = "active" | "revoked" | "expired";

/**
 * The "RefreshToken" entity represents a long-lived authentication token
 * used to renew access tokens without requiring the user to log in again.
 *
 * Fields:
 * - `id`: UUID identifier
 * - `user_id`: foreign key referencing the user who owns the token
 * - `token`: unique secure token string (stored server-side only)
 * - `status`: current lifecycle state ("active", "revoked", "expired")
 * - `expires_at`: timestamp after which the token becomes invalid
 * - `revoked_at`: timestamp when the token was explicitly revoked (nullable)
 * - `created_at`: automatic creation timestamp
 * - `updated_at`: automatic update timestamp
 */
export default class RefreshToken extends Model {
  declare id: string;
  declare user_id: string;
  declare token: string;
  declare status: RefreshTokenStatus;
  declare created_at: Date;
  declare updated_at: Date;
  declare expires_at: Date;
  declare revoked_at: Date | null;

  declare user?: User;

  public isValid(): boolean {
    return this.status === "active" && dayjs().isBefore(this.expires_at) && !this.revoked_at;
  }

  public async markAsRevoked(options?: SaveOptions): Promise<void> {
    if (this.status !== "active") return;

    this.status = "revoked";
    this.revoked_at = dayjs().toDate();
    await this.save(options);
  }

  public async markAsExpired(options?: SaveOptions): Promise<void> {
    if (this.status !== "active" || !dayjs().isAfter(this.expires_at)) return;

    this.status = "expired";
    await this.save(options);
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
        name: "idx_refresh_status",
        fields: ["status"],
      },
      {
        name: "idx_refresh_user_status",
        fields: ["user_id", "status"],
      },
    ],
  }
);

RefreshToken.beforeSave((token: RefreshToken): void => {
  if (token.expires_at <= token.created_at) {
    throw new Error("expires_at must be after created_at");
  }
});
