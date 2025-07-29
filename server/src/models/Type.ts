import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.js";

import type { Universe } from "@/models/index.js";

/**
 * The "Type" entity represents a category or classification of names
 * within a given universe. It allows names to be grouped by their role,
 * species, class, or other narrative function.
 *
 * Each type belongs to a specific universe and can include things like:
 * - "Elf", "Orc", "Dragon" in a fantasy universe
 * - "Cyborg", "Android", "Alien", "AI" in a sci-fi universe
 * - "Greek", "Egyptian", "Norse" in a gods universe
 *
 * Fields :
 * - `label`: a short unique identifier (e.g., "elf", "cyborg", "greek_god")
 * - `display_name`: the user-facing name (e.g., "Elf", "Cyborg", "Greek God")
 * - `description`: optional text explaining what this type represents
 * - `icon_url`: optional URL pointing to a representative icon
 * - `universe_id`: foreign key linking to the "Universe" model
 */
export default class Type extends Model {
  declare id: string;
  declare label: string;
  declare display_name: string;
  declare description: string | null;
  declare icon_url: string | null;
  declare universe_id: number;

  declare universe?: Universe;
}

Type.init(
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
    display_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    universe_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "universes", key: "id" },
      onDelete: "RESTRICT",
    },
  },
  {
    sequelize,
    modelName: "Type",
    tableName: "types",
    timestamps: false,
    indexes: [
      {
        name: "idx_types_universe_id",
        fields: ["universe_id"],
      },
    ],
  }
);
