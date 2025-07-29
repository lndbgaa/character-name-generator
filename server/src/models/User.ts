import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.js";
import { nameRegex, passwordRegex, pseudoRegex } from "@/validators/patterns.js";

import type { SaveOptions } from "sequelize";

type UserStatus = "active" | "suspended" | "deleted";

/**
 * The "User" entity represents a registered user of the application.
 *
 * User passwords are automatically hashed before being saved to the database.
 *
 *  Fields:
 * - `id`: UUID identifier
 * - `email`: unique email address, used for login
 * - `pseudo`: unique public username (3–20 characters)
 * - `password`: hashed user password (8–100 characters)
 * - `first_name`: user's first name (2–50 characters)
 * - `last_name`: user's last name (2–100 characters)
 * - `avatar_url`: optional URL to the user's avatar image
 * - `status`: current account status ("active", "suspended", "deleted")
 * - `last_login`: timestamp of the last successful login
 * - `suspended_at`: timestamp of suspension, if applicable
 * - `deleted_at`: timestamp of soft deletion, if applicable
 * - `created_at`: automatic creation timestamp
 * - `updated_at`: automatic update timestamp
 */
export default class User extends Model {
  declare id: string;
  declare email: string;
  declare pseudo: string;
  declare password: string;
  declare first_name: string;
  declare last_name: string;
  declare avatar_url: string | null;
  declare status: UserStatus;
  declare last_login: Date;
  declare created_at: Date;
  declare updated_at: Date;
  declare suspended_at: Date | null;
  declare deleted_at: Date | null;

  public async checkPassword(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.password);
  }

  public async updatePassword(newPassword: string, options?: SaveOptions): Promise<void> {
    this.password = newPassword;
    await this.save(options);
  }

  public async updateLastLogin(options?: SaveOptions): Promise<void> {
    this.last_login = dayjs().toDate();
    await this.save(options);
  }

  public async suspend(options?: SaveOptions): Promise<void> {
    if (this.status === "active") {
      this.status = "suspended";
      this.suspended_at = dayjs().toDate();
      await this.save(options);
    }
  }

  public async reactivate(options?: SaveOptions): Promise<void> {
    if (this.status === "suspended") {
      this.status = "active";
      this.suspended_at = null;
      await this.save(options);
    }
  }

  public async deleteSoft(options?: SaveOptions): Promise<void> {
    if (this.status !== "deleted") {
      this.status = "deleted";
      this.deleted_at = dayjs().toDate();
      this.suspended_at = null;
      await this.save(options);
    }
  }

  public isActive(): boolean {
    return this.status === "active";
  }

  public isSuspended(): boolean {
    return this.status === "suspended";
  }

  public isDeleted(): boolean {
    return this.status === "deleted";
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    pseudo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 20],
        is: pseudoRegex,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [8, 100],
        is: passwordRegex,
      },
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50],
        is: nameRegex,
      },
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
        is: nameRegex,
      },
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "suspended", "deleted"),
      defaultValue: "active",
    },
    last_login: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    suspended_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "idx_users_status",
        fields: ["status"],
      },
    ],
  }
);

User.beforeSave(async (user: User): Promise<void> => {
  if (user.changed("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});
