import { DataTypes, Model } from "sequelize";

import { GENDERS_DISPLAY, GENDERS_LABEL } from "@/constants/gender.constants.js";
import { sequelize } from "@/database/mysql.database.js";

import type { GenderDisplay, GenderId, GenderLabel } from "@/types/gender.types.js";

const LABEL_MAX = 50;

const DISPLAY_NAME_MAX = 100;

/**
 * The `Gender` entity defines the grammatical or narrative gender
 * associated with a given name.
 *
 * Fields :
 * - `label`: Short unique identifier (e.g., "male", "female", "neutral").
 * - `display_name`: User-facing label (e.g., "Male", "Female", "Neutral")
 */
export default class Gender extends Model {
  declare id: GenderId;
  declare label: GenderLabel;
  declare display_name: GenderDisplay;
}

Gender.init(
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
        isIn: [Object.values(GENDERS_LABEL)],
      },
    },
    display_name: {
      type: DataTypes.STRING(DISPLAY_NAME_MAX),
      allowNull: false,
      unique: true,
      validate: {
        isIn: [Object.values(GENDERS_DISPLAY)],
      },
    },
  },
  {
    sequelize,
    modelName: "Gender",
    tableName: "genders",
    timestamps: false,
  }
);
