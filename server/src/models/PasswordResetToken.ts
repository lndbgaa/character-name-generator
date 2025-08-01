import dayjs from "dayjs";
import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.js";

import type { User } from "@/models/index.js";
import type { SaveOptions } from "sequelize";

type PasswordResetTokenStatus = "active" | "used" | "expired";

/**
 * The "PasswordResetToken" entity represents a time-limited token
 * used to allow a user to reset their password securely.
 *
 *  Fields:
 * - `id`: UUID identifier
 * - `user_id`: foreign key referencing the user who requested the reset
 * - `token`: secure unique string used for verification
 * - `status`: current status of the token ("active", "used", "expired")
 * - `expires_at`: expiration timestamp (token is invalid after this point)
 * - `used_at`: timestamp of when the token was used (null if unused)
 * - `created_at`: automatic creation timestamp
 * - `updated_at`: automatic update timestamp
 */
export default class PasswordResetToken extends Model {
  declare id: string;
  declare user_id: string;
  declare token: string;
  declare status: PasswordResetTokenStatus;
  declare created_at: Date;
  declare updated_at: Date;
  declare expires_at: Date;
  declare used_at: Date | null;

  declare user?: User;

  public isValid(): boolean {
    return this.status === "active" && dayjs().isBefore(this.expires_at);
  }

  public async markAsUsed(options?: SaveOptions): Promise<void> {
    if (this.status !== "active") return;

    this.status = "used";
    this.used_at = dayjs().toDate();
    await this.save(options);
  }

  public async markAsExpired(options?: SaveOptions): Promise<void> {
    if (this.status !== "active" || !dayjs().isAfter(this.expires_at)) return;

    this.status = "expired";
    await this.save(options);
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
        name: "idx_reset_status",
        fields: ["status"],
      },
      {
        name: "idx_reset_user_status",
        fields: ["user_id", "status"],
      },
    ],
  }
);

PasswordResetToken.beforeSave((token: PasswordResetToken): void => {
  if (token.expires_at <= token.created_at) {
    throw new Error("expires_at must be after created_at");
  }
});
