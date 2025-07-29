import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.js";

/**
 * The "Universe" entity represents a fictional or thematic world
 * used to categorize names by genre or narrative setting.
 *
 * Examples include fantasy realms, medieval worlds, science fiction universes
 * or divine pantheons.
 *
 * Fields :
 * - `label`: a short unique identifier (e.g., "fantasy", "sci_fi", "medieval")
 * - `display_name`: the full name shown to users (e.g., "Fantasy", "Science Fiction", "Medieval" )
 * - `description`: optional text to describe the lore or characteristics of the universe
 */
export default class Universe extends Model {
  declare id: string;
  declare label: string;
  declare display_name: string;
  declare description: string | null;
}

Universe.init(
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
  },
  {
    sequelize,
    modelName: "Universe",
    tableName: "universes",
    timestamps: false,
  }
);
