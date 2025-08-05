import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.js";
import CustomError from "@/utils/CustomError.js";
import { toDateOnly, toTimeOnly } from "@/utils/date.utils.js";
import setIfChanged from "@/utils/setIfChanged.js";
import { nameRegex, passwordRegex, usernameRegex } from "@/validators/patterns.js";

import type { Role } from "@/models/index.js";
import type {
  AdminUserDTO,
  PrivateUserDTO,
  PublicUserDTO,
  UpdateUserData,
  UserAccountStatus,
} from "@/types/user.types";
import type { SaveOptions } from "sequelize";

/**
 * The "User" entity represents a registered user of the application.
 *
 * Fields:
 * - `id`: UUID identifier, primary key for the user.
 * - `role_id`: foreign key referring to the user's role (e.g., user, admin). Defaults to role_id = 2 ("user").
 * - `email`: unique email address, used for authentication and communication.
 * - `username`: unique public username (3–20 characters).
 * - `password`: hashed password (8–100 characters).
 * - `first_name`: user's first name (2–50 characters).
 * - `last_name`: user's last name (2–100 characters).
 * - `avatar_url`: optional URL string pointing to the user's avatar image.
 * - `status`: account status — can be "active", "suspended", or "deleted".
 * - `last_login`: timestamp of the user's most recent successful login.
 * - `suspended_at`: timestamp marking when the account was suspended (nullable).
 * - `deleted_at`: timestamp marking when the account was soft-deleted (nullable).
 * - `created_at`: automatic creation timestamp
 * - `updated_at`: automatic update timestamp
 */
export default class User extends Model {
  declare id: string;
  declare role_id: number;
  declare email: string;
  declare username: string;
  declare password: string;
  declare first_name: string;
  declare last_name: string;
  declare avatar_url: string | null;
  declare status: UserAccountStatus;
  declare last_login: Date;
  declare created_at: Date;
  declare updated_at: Date;
  declare suspended_at: Date | null;
  declare deleted_at: Date | null;

  declare role?: Role;

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

  public async updateAvatar(url: string, options?: SaveOptions): Promise<void> {
    this.avatar_url = url;
    await this.save(options);
  }

  public async updateProfile(data: UpdateUserData, options?: SaveOptions): Promise<User> {
    const updatedFields: string[] = [];

    if (setIfChanged(this, "username", data.username, false)) updatedFields.push("username");
    if (setIfChanged(this, "first_name", data.firstName, false)) updatedFields.push("first_name");
    if (setIfChanged(this, "last_name", data.lastName, false)) updatedFields.push("last_name");
    if (setIfChanged(this, "password", data.password, false)) updatedFields.push("password");

    if (updatedFields.length === 0) {
      throw new CustomError({
        statusCode: 400,
        message: "No changes detected.",
      });
    }

    return await this.save({ ...options, fields: updatedFields });
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

  public toPublicDTO(): PublicUserDTO {
    return {
      id: this.id,
      username: this.username,
      avatarUrl: this.avatar_url,
      createdAt: {
        date: toDateOnly(this.created_at),
        time: toTimeOnly(this.created_at),
      },
    };
  }

  public toPrivateDTO(): PrivateUserDTO {
    return {
      ...this.toPublicDTO(),
      role: this.role?.label || "user",
      firstName: this.first_name,
      lastName: this.last_name,
      lastLogin: {
        date: toDateOnly(this.last_login),
        time: toTimeOnly(this.last_login),
      },
    };
  }

  public toAdminDTO(): AdminUserDTO {
    return {
      ...this.toPrivateDTO(),
      email: this.email,
      status: this.status,
    };
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    role_id: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
      references: { model: "roles", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
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
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 20],
        is: usernameRegex,
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
