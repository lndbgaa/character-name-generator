import { DataTypes, Model } from "sequelize";

import { ACCOUNT_ROLES_DISPLAY, ACCOUNT_ROLES_LABEL } from "@/constants/user.constants.js";
import { sequelize } from "@/database/mysql.database.js";

import type { AccountRoleDisplay, AccountRoleId, AccountRoleLabel } from "@/types/users/user.types.js";

const LABEL_MAX = 50;

const DISPLAY_NAME_MAX = 100;

/**
 * The `Role` entity represents an account's permission level or responsibility.
 *
 * Fields :
 * - `label`: Short unique identifier (e.g., "admin", "user", "moderator").
 * - `display_name`: User-facing label (e.g., "Administrator", "User", "Moderator")
 */
export default class Role extends Model {
  declare id: AccountRoleId;
  declare label: AccountRoleLabel;
  declare display_name: AccountRoleDisplay;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(LABEL_MAX),
      allowNull: false,
      unique: true,
      validate: {
        isIn: [Object.values(ACCOUNT_ROLES_LABEL)],
      },
    },
    display_name: {
      type: DataTypes.STRING(DISPLAY_NAME_MAX),
      allowNull: false,
      unique: true,
      validate: {
        isIn: [Object.values(ACCOUNT_ROLES_DISPLAY)],
      },
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles",
    timestamps: false,
  }
);
