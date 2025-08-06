import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.js";

export default class Role extends Model {
  declare id: number;
  declare label: string;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    label: {
      type: DataTypes.STRING(50),
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
