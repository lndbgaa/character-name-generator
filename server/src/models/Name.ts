import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.js";

import type { Gender, Type } from "@/models/index.js";

type NameLength = "long" | "medium" | "short";

/**
 * The "Name" entity represents a character name associated with a specific type and gender.
 *
 * Each name is categorized by:
 * - its type (e.g., Elf, Orc, Greek God, Android)
 * - its gender (e.g., Male, Female, Neutral)
 * - its length (e.g., Short, Medium, Long)
 *
 * A given name can exist in multiple types, but it must be unique within the same type.
 *
 *  Fields :
 * - `id`: UUID identifier
 * - `label`: the actual character name (e.g., "Thalor", "Xenara")
 * - `type_id`: foreign key linking to the "Type" model
 * - `gender_id`: foreign key linking to the "Gender" model
 * - `length`: enum defining name size ("short", "medium", "long")
 * - `created_at`: automatic creation timestamp
 * - `updated_at`: automatic update timestamp
 */
export default class Name extends Model {
  declare id: string;
  declare label: string;
  declare type_id: number;
  declare gender_id: number;
  declare length: NameLength;
  declare created_at: Date;
  declare updated_at: Date;

  declare type?: Type;
  declare gender?: Gender;
}

Name.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "types", key: "id" },
      onDelete: "RESTRICT",
    },
    gender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "genders", key: "id" },
      onDelete: "RESTRICT",
    },
    length: {
      type: DataTypes.ENUM("long", "medium", "short"),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Name",
    tableName: "names",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "uniq_names_label_type",
        unique: true,
        fields: ["label", "type_id"],
      },
      {
        name: "idx_names_type",
        fields: ["type_id"],
      },
      {
        name: "idx_names_type_gender",
        fields: ["type_id", "gender_id"],
      },
    ],
  }
);
