import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.js";
import CustomError from "@/utils/CustomError.js";
import setIfChanged from "@/utils/setIfChanged.js";

import type { Universe } from "@/models/index.js";
import type { UpdateTypeData } from "@/types/types.types.js";
import type { SaveOptions } from "sequelize";

export const LABEL_MAX = 50;
export const DISPLAY_NAME_MAX = 100;
export const DESCRIPTION_MAX = 500;
export const ICON_URL_MAX = 255;

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

  public async updateInfo(data: UpdateTypeData, options?: SaveOptions): Promise<Type> {
    const updatedFields: string[] = [];

    if (setIfChanged(this, "universe_id", data.universeId, false)) updatedFields.push("universe_id");
    if (setIfChanged(this, "display_name", data.displayName, false)) updatedFields.push("display_name");
    if (setIfChanged(this, "description", data.description, true)) updatedFields.push("description");
    if (setIfChanged(this, "icon_url", data.iconUrl, true)) updatedFields.push("icon_url");

    if (updatedFields.length === 0) {
      throw new CustomError({
        statusCode: 400,
        message: "No changes detected.",
      });
    }

    await this.save({ ...options, fields: updatedFields });

    return await this.reload({ include: [{ association: "universe" }] });
  }

  public toAdminDTO() {
    return {
      id: this.id,
      label: this.label,
      displayName: this.display_name,
      description: this.description,
      iconUrl: this.icon_url,
      universe: this.universe,
    };
  }
}

Type.init(
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
    icon_url: {
      type: DataTypes.STRING(ICON_URL_MAX),
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
