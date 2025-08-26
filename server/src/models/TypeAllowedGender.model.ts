import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.database.js";

import type { GenderId } from "@/types/gender.types.js";

/**
 * The `TypeAllowedGender` entity defines which genders
 * are valid/available for a given type.
 *
 * Composite primary key : (type_id, gender_id)
 */
export default class TypeAllowedGender extends Model {
  declare type_id: number;
  declare gender_id: GenderId;
}

TypeAllowedGender.init(
  {
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "types",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    gender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "genders",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "TypeAllowedGender",
    tableName: "type_allowed_genders",
    timestamps: false,
  }
);
