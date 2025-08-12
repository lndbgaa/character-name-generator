import dayjs from "dayjs";
import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.js";
import CustomError from "@/utils/CustomError.js";
import { toDateOnly, toTimeOnly } from "@/utils/date.utils.js";
import setIfChanged from "@/utils/setIfChanged.js";
import { labelRegex } from "@/validators/patterns.js";

import type { Universe } from "@/models/index.js";
import type { TypeAdminDTO, TypePublicDTO, TypeStatus, UpdateTypeData } from "@/types/types.types.js";
import type { SaveOptions } from "sequelize";

export const LABEL_MIN = 2;
export const LABEL_MAX = 50;

export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 100;

export const DESCRIPTION_MIN = 20;
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
  declare id: number;
  declare label: string;
  declare display_name: string;
  declare description: string | null;
  declare icon_url: string | null;
  declare universe_id: number;
  declare status: TypeStatus;
  declare created_at: Date;
  declare updated_at: Date;
  declare archived_at: Date | null;
  declare deactivated_at: Date | null;

  declare universe?: Universe;

  /**
   *
   * @param data
   * @param options
   * @returns
   */
  public async updateFields(data: UpdateTypeData, options?: SaveOptions): Promise<Type> {
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

  /**
   *
   * @param newStatus
   * @returns
   */
  public async setStatus(newStatus: TypeStatus, options?: SaveOptions): Promise<Type> {
    if (newStatus === this.status) {
      return await this.reload({ include: [{ association: "universe" }] });
    }

    if (this.status === "archived" && newStatus !== "archived") {
      throw new CustomError({
        statusCode: 422,
        message: "Cannot change status of an archived type.",
      });
    }

    switch (newStatus) {
      case "active":
        this.status = "active";
        this.deactivated_at = null;
        break;
      case "inactive":
        this.status = "inactive";
        this.deactivated_at = dayjs().toDate();
        break;
      case "archived":
        this.status = "archived";
        this.deactivated_at = null;
        this.archived_at = dayjs().toDate();
        break;
    }

    await this.save(options);

    return await this.reload({ include: [{ association: "universe" }] });
  }

  /**
   *
   * @returns
   */
  public toPublicDTO(): TypePublicDTO {
    return {
      id: this.id,
      label: this.label,
      displayName: this.display_name,
      description: this.description,
      iconUrl: this.icon_url,
      universe: this.universe?.toPublicDTO() ?? null,
    };
  }

  /**
   *
   * @returns
   */
  public toAdminDTO(): TypeAdminDTO {
    return {
      ...this.toPublicDTO(),
      universe: this.universe?.toAdminDTO() ?? null,
      status: this.status,
      createdAt: {
        date: toDateOnly(this.created_at),
        time: toTimeOnly(this.created_at),
      },
      updatedAt: {
        date: toDateOnly(this.updated_at),
        time: toTimeOnly(this.updated_at),
      },
      deactivatedAt: this.deactivated_at
        ? {
            date: toDateOnly(this.deactivated_at),
            time: toTimeOnly(this.deactivated_at),
          }
        : undefined,
      archivedAt: this.archived_at
        ? {
            date: toDateOnly(this.archived_at),
            time: toTimeOnly(this.archived_at),
          }
        : undefined,
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
      validate: {
        notEmpty: {
          msg: "The label cannot be empty.",
        },
        len: {
          args: [LABEL_MIN, LABEL_MAX],
          msg: `The label must be between ${LABEL_MIN} and ${LABEL_MAX} characters long.`,
        },
        is: {
          args: labelRegex,
          msg: "The label can only contain letters, numbers and underscores.",
        },
      },
    },
    display_name: {
      type: DataTypes.STRING(DISPLAY_NAME_MAX),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "The display name cannot be empty.",
        },
        len: {
          args: [DISPLAY_NAME_MIN, DISPLAY_NAME_MAX],
          msg: `The display name must be between ${DISPLAY_NAME_MIN} and ${DISPLAY_NAME_MAX} characters long.`,
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [DESCRIPTION_MIN, DESCRIPTION_MAX],
          msg: `The description must be between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX} characters long.`,
        },
      },
    },
    icon_url: {
      type: DataTypes.STRING(ICON_URL_MAX),
      allowNull: true,
      validate: {
        len: {
          args: [1, ICON_URL_MAX],
          msg: `The icon URL must be at most ${ICON_URL_MAX} characters long.`,
        },
        isUrl: {
          msg: "The icon URL must be a valid URL.",
        },
      },
    },
    universe_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "universes", key: "id" },
      onDelete: "RESTRICT",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "archived"),
      allowNull: false,
      defaultValue: "active",
    },
    archived_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deactivated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Type",
    tableName: "types",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "idx_types_universe_id",
        fields: ["universe_id"],
      },
      {
        name: "idx_types_status",
        fields: ["status"],
      },
    ],
  }
);

Type.beforeValidate((type: Type) => {
  if (type.label && typeof type.label === "string") {
    type.label = type.label.trim().toLowerCase();
  }

  if (type.display_name && typeof type.display_name === "string") {
    type.display_name = type.display_name.trim();
  }

  if (typeof type.icon_url === "string") {
    type.icon_url = type.icon_url.trim();
  }

  if (typeof type.description === "string") {
    type.description = type.description.trim();
  }
});
