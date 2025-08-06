import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.js";
import CustomError from "@/utils/CustomError.js";
import setIfChanged from "@/utils/setIfChanged.js";

import type { UpdateUniverseData } from "@/types/universe.types.js";
import type { SaveOptions } from "sequelize";

export const LABEL_MAX = 50;
export const DISPLAY_NAME_MAX = 100;
export const DESCRIPTION_MAX = 500;

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
  declare id: number;
  declare label: string;
  declare display_name: string;
  declare description: string | null;

  public async updateInfo(data: UpdateUniverseData, options?: SaveOptions): Promise<Universe> {
    const updatedFields: string[] = [];

    if (setIfChanged(this, "display_name", data.displayName, false)) updatedFields.push("display_name");
    if (setIfChanged(this, "description", data.description, true)) updatedFields.push("description");

    if (updatedFields.length === 0) {
      throw new CustomError({
        statusCode: 400,
        message: "No changes detected.",
      });
    }

    return await this.save({ ...options, fields: updatedFields });
  }
}

Universe.init(
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
    display_name: {
      type: DataTypes.STRING(DISPLAY_NAME_MAX),
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
    defaultScope: {
      order: [["display_name", "ASC"]],
    },
  }
);

Universe.beforeSave((universe: Universe) => {
  if (universe.label) {
    universe.label = universe.label.trim().toLowerCase();
  }
});
