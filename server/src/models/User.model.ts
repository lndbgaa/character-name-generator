import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { DataTypes, Model } from "sequelize";

import {
  ACCOUNT_ROLES_LABEL,
  ACCOUNT_ROLES_MAP_REVERSE,
  ACCOUNT_STATUSES,
} from "@/constants/user.constants.js";

import { sequelize } from "@/database/mysql.database.js";
import CustomError from "@/utils/CustomError.utils.js";
import { toDateOnly, toTimeOnly } from "@/utils/date.utils.js";
import setIfChanged from "@/utils/set-if-changed.utils.js";
import { capitalize } from "@/utils/string.utils.js";
import { nameRegex, passwordRegex, usernameRegex } from "@/validators/patterns.js";

import type { Role } from "@/models/index.js";
import type {
  AccountRoleId,
  AccountStatus,
  AdminUserDTO,
  PrivateUserDTO,
  PublicUserDTO,
  UpdateUserData,
} from "@/types/users/user.types.js";

import type { SaveOptions } from "sequelize";

export const EMAIL_MAX = 100;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const PLAIN_PASSWORD_MIN = 8;
export const PLAIN_PASSWORD_MAX = 100;
export const HASHED_PASSWORD_MAX = 255;
export const FIRST_NAME_MIN = 2;
export const FIRST_NAME_MAX = 50;
export const LAST_NAME_MIN = 2;
export const LAST_NAME_MAX = 100;
export const AVATAR_URL_MAX = 255;

const { ACTIVE, SUSPENDED, DELETED } = ACCOUNT_STATUSES;
const { USER } = ACCOUNT_ROLES_LABEL;

/**
 * The `User` entity represents a registered user of the application.
 *
 * Fields:
 * - `role_id`: Foreign key linking to the related `Role` record. Defaults to role_id = 2 ("user").
 * - `email`: Unique email address, used for authentication and communication.
 * - `username`: Unique public username (3–20 characters).
 * - `password`: Hashed password (8–100 characters).
 * - `first_name`: User's first name (2–50 characters).
 * - `last_name`: User's last name (2–100 characters).
 * - `avatar_url`: Optional URL string pointing to the user's avatar image.
 * - `status`: Account status — can be "active", "suspended", or "deleted".
 * - `is_verified`:
 * - `last_login`: Timestamp of the user's most recent successful login.
 * - `created_at`: Automatic creation timestamp.
 * - `updated_at`: Automatic update timestamp.
 * - `suspended_at`: When the account was suspended (nullable).
 * - `deleted_at`: When the account was soft-deleted (nullable).
 */
export default class User extends Model {
  declare id: string;
  declare role_id: AccountRoleId;
  declare email: string;
  declare username: string;
  declare password: string;
  declare first_name: string;
  declare last_name: string;
  declare avatar_url: string | null;
  declare status: AccountStatus;
  declare is_verified: boolean;
  declare last_login: Date;
  declare created_at: Date;
  declare updated_at: Date;
  declare suspended_at: Date | null;
  declare deleted_at: Date | null;

  declare role?: Role;

  /**
   * Compares a plain password with the hashed password.
   *
   * @param {string} plainPassword - The plain password provided by the user.
   * @returns {Promise<boolean>} True if the passwords match.
   */
  public async checkPassword(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.password);
  }

  /**
   * Marks the user as verified (email successfully confirmed).
   *
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<User>} The updated `User` instance.
   */
  public async markAsVerified(options?: SaveOptions): Promise<User> {
    if (!this.is_verified) {
      this.is_verified = true;
      await this.save({ ...options, fields: ["is_verified"] });
    }

    return this;
  }

  /**
   * Updates the user's password.
   *
   * @param {string} newPassword - The new plain password.
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<void>}
   */
  public async setPassword(newPassword: string, options?: SaveOptions): Promise<void> {
    this.password = newPassword;
    await this.save({ ...options, fields: ["password"] });
  }

  /**
   * Updates the user's last login timestamp to the current time.
   *
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<void>}
   */
  public async setLastLogin(options?: SaveOptions): Promise<void> {
    this.last_login = dayjs().toDate();
    await this.save({ ...options, fields: ["last_login"] });
  }

  /**
   * Updates the user's avatar.
   *
   * @param {string} url - The new avatar URL.
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<void>}
   */
  public async setAvatar(url: string, options?: SaveOptions): Promise<void> {
    this.avatar_url = url;
    await this.save({ ...options, fields: ["avatar_url"] });
  }

  /**
   * Updates and persists selected user profile fields.
   *
   * Uses `setIfChanged` to compare current and new values, ensuring that
   * only fields whose values have actually changed are persisted.
   *
   * @param {UpdateUserData} data - The new data to apply.
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<User>} The updated `User` instance.
   * @throws {CustomError} If:
   *   - No fields were modified (400 Bad Request).
   */
  public async setProfile(data: UpdateUserData, options?: SaveOptions): Promise<User> {
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

  /**
   * Suspends the user's account (status set to "suspended").
   *
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<User>} The updated `User` instance.
   */
  public async suspend(options?: SaveOptions): Promise<User> {
    if (this.status === ACTIVE) {
      this.status = SUSPENDED;
      this.suspended_at = dayjs().toDate();
      await this.save({ ...options, fields: ["status", "suspended_at"] });
    }

    return this;
  }

  /**
   * Reactivates the user's account (status set to "active").
   *
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<User>} The updated `User` instance.
   */
  public async reactivate(options?: SaveOptions): Promise<User> {
    if (this.status === SUSPENDED) {
      this.status = ACTIVE;
      this.suspended_at = null;
      await this.save({ ...options, fields: ["status", "suspended_at"] });
    }

    return this;
  }

  /**
   * Soft deletes the user's account (status set to "deleted").
   *
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<User>} The updated `User` instance.
   */
  public async deleteSoft(options?: SaveOptions): Promise<User> {
    if (this.status !== DELETED) {
      this.status = DELETED;
      this.deleted_at = dayjs().toDate();
      this.suspended_at = null;
      await this.save({ ...options, fields: ["status", "deleted_at", "suspended_at"] });
    }

    return this;
  }

  /**
   * Checks whether the user's account has the given status.
   *
   * @param {AccountStatus} status - The status to check against.
   * @returns {boolean} True if the account has the specified status.
   */
  public hasStatus(status: AccountStatus): boolean {
    return this.status === status;
  }

  /**
   * Converts the `User` instance to its public data transfer object (DTO).
   *
   * @returns {PublicUserDTO} The public representation of the user.
   */
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

  /**
   * Converts the `User` instance to its private data transfer object (DTO).
   *
   * @returns {PrivateUserDTO} The private representation of the user.
   */
  public toPrivateDTO(): PrivateUserDTO {
    return {
      ...this.toPublicDTO(),
      role: this.role?.label || USER,
      firstName: this.first_name,
      lastName: this.last_name,
      lastLogin: {
        date: toDateOnly(this.last_login),
        time: toTimeOnly(this.last_login),
      },
    };
  }

  /**
   * Converts the `User` instance to its admin data transfer object (DTO).
   *
   * @returns {AdminUserDTO} The admin representation of the user.
   */
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
      defaultValue: ACCOUNT_ROLES_MAP_REVERSE[USER],
      references: { model: "roles", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    email: {
      type: DataTypes.STRING(EMAIL_MAX),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Invalid email." },
      },
    },
    username: {
      type: DataTypes.STRING(USERNAME_MAX),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Username required." },
        len: {
          args: [USERNAME_MIN, USERNAME_MAX],
          msg: "Invalid username length.",
        },
        is: {
          args: usernameRegex,
          msg: "Invalid username format.",
        },
      },
    },
    password: {
      type: DataTypes.STRING(HASHED_PASSWORD_MAX),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Password required." },
        len: {
          args: [PLAIN_PASSWORD_MIN, PLAIN_PASSWORD_MAX],
          msg: "Invalid password length.",
        },
        is: {
          args: passwordRegex,
          msg: "Invalid password format.",
        },
      },
    },
    first_name: {
      type: DataTypes.STRING(FIRST_NAME_MAX),
      allowNull: false,
      validate: {
        notEmpty: { msg: "First name required." },
        len: {
          args: [FIRST_NAME_MIN, FIRST_NAME_MAX],
          msg: "Invalid first name length.",
        },
        is: {
          args: nameRegex,
          msg: "Invalid first name format.",
        },
      },
    },
    last_name: {
      type: DataTypes.STRING(LAST_NAME_MAX),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Last name required." },
        len: {
          args: [LAST_NAME_MIN, LAST_NAME_MAX],
          msg: "Invalid last name length.",
        },
        is: {
          args: nameRegex,
          msg: "Invalid last name format.",
        },
      },
    },
    avatar_url: {
      type: DataTypes.STRING(AVATAR_URL_MAX),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ACCOUNT_STATUSES)),
      allowNull: false,
      defaultValue: ACTIVE,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
        name: "idx_users_first_name",
        fields: ["first_name"],
      },
      {
        name: "idx_users_last_name",
        fields: ["last_name"],
      },
      {
        name: "idx_users_role_status_created",
        fields: ["role_id", "status", "created_at"],
      },
      {
        name: "idx_users_status_created",
        fields: ["status", "created_at"],
      },
    ],
  }
);

User.beforeValidate((user: User) => {
  if (typeof user.email === "string") {
    user.email = user.email.trim().toLowerCase();
  }

  if (typeof user.username === "string") {
    user.username = user.username.trim();
  }

  if (typeof user.first_name === "string") {
    user.first_name = capitalize(user.first_name);
  }

  if (typeof user.last_name === "string") {
    user.last_name = capitalize(user.last_name);
  }

  if (typeof user.avatar_url === "string" && user.avatar_url.trim().length > 0) {
    user.avatar_url = user.avatar_url.trim();
  } else {
    user.avatar_url = null;
  }
});

User.beforeSave(async (user: User): Promise<void> => {
  if (user.changed("password") && !user.password.startsWith("$2b$")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});
