import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.js";

/**
 * The "Gender" entity defines the grammatical or narrative gender
 * associated with a given name.
 *
 * This can be used to categorize names as masculine, feminine, neutral, or other culturally specific classifications.
 *
 * Fields :
 * - `label`: a short unique identifier (e.g., "male", "female", "neutral")
 * - `display_name`: the user-facing label (e.g., "Male", "Female", "Neutral")
 */
export default class Gender extends Model {
  declare id: string;
  declare label: string;
  declare display_name: string;
}

Gender.init(
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
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Gender",
    tableName: "genders",
    timestamps: false,
  }
);
