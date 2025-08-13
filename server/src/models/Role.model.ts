import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.js";

import type { AccountRoleId, AccountRoleLabel } from "@/types/users/user.types.js";

const LABEL_MAX = 50;

export default class Role extends Model {
  declare id: AccountRoleId;
  declare label: AccountRoleLabel;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    label: {
      type: DataTypes.STRING(LABEL_MAX),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles",
    timestamps: false,
  }
);
