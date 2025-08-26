import dayjs from "dayjs";
import { DataTypes, Model } from "sequelize";

import { IMAGE_URL_MAX_LENGTH } from "@/constants/common.constants.js";
import {
  TYPE_DESCRIPTION_MAX_LENGTH,
  TYPE_DESCRIPTION_MIN_LENGTH,
  TYPE_DISPLAY_NAME_MAX_LENGTH,
  TYPE_DISPLAY_NAME_MIN_LENGTH,
  TYPE_LABEL_MAX_LENGTH,
  TYPE_LABEL_MIN_LENGTH,
  TYPE_STATUSES,
} from "@/constants/type.constants.js";

import { sequelize } from "@/database/mysql.database.js";
import CustomError from "@/utils/CustomError.utils.js";
import { toDateOnly, toTimeOnly } from "@/utils/date.utils.js";
import setIfChanged from "@/utils/set-if-changed.utils.js";
import { capitalize, normalizeLabel } from "@/utils/string.utils.js";
import { labelRegex } from "@/validators/patterns.js";

import type { Gender, Universe } from "@/models/index.js";
import type {
  TypeAdminDTO,
  TypeColorTheme,
  TypePublicDTO,
  TypeStatus,
  UpdateTypePayload,
} from "@/types/types.types.js";
import type {
  BelongsToManyCountAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  SaveOptions,
} from "sequelize";

/**
 * The `Type` entity represents a category or classification of names
 * within a given universe. It allows names to be grouped by their role,
 * species, class, or other narrative function.
 *
 * Each type belongs to a specific universe and can include things like:
 * - "Elf", "Orc", "Dragon" in a fantasy universe
 * - "Cyborg", "Android", "Alien", "AI" in a sci-fi universe
 * - "Greek", "Egyptian", "Norse" in a gods universe
 *
 * Fields :
 * - `label`: short unique identifier (e.g., "elf", "cyborg", "greek_god").
 * - `display_name`: User-facing name (e.g., "Elf", "Cyborg", "Greek God").
 * - `description`: Text explaining what the type represents.
 * - `icon_url`: URL pointing to a representative icon of the type.
 * - `card_image_url`: URL pointing to a larger image used in card-style UI representations of the type.
 * - `background_image_url`: URL pointing to a full background illustration or banner image associated with the type.
 * - `universe_id`: Foreign key linking to the related `Universe` record.
 * - `status` ("active" | "inactive" | "archived"): Lifecycle state of the type.
 *     - `active`: visible and usable
 *     - `inactive`: hidden but can be reactivated
 *     - `archived`: locked, no longer modifiable
 * - `created_at`: Automatic creation timestamp.
 * - `updated_at`: Automatic update timestamp.
 * - `deactivated_at`: When the type was set to inactive (nullable).
 * - `archived_at`: When the type was archived (nullable).
 */
export default class Type extends Model {
  declare id: number;
  declare label: string;
  declare display_name: string;
  declare description: string;
  declare color_theme: TypeColorTheme;
  declare icon_url: string;
  declare card_image_url: string;
  declare background_image_url: string;
  declare universe_id: number;
  declare status: TypeStatus;
  declare created_at: Date;
  declare updated_at: Date;
  declare deactivated_at: Date | null;
  declare archived_at: Date | null;

  declare universe?: Universe;
  declare allowed_genders?: Gender[];

  declare countAllowed_genders: BelongsToManyCountAssociationsMixin;
  declare setAllowed_genders: BelongsToManySetAssociationsMixin<Gender, number>;

  /**
   * Updates specific fields of the type.
   *
   * Uses `setIfChanged` to compare current and new values, ensuring that
   * only fields whose values have actually changed are persisted.
   *
   * @param {UpdateTypeData} data - The new data to apply.
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<Type>} The updated `Type` instance with its `Universe` relation loaded.
   * @throws {CustomError} If no fields were modified (400 No changes detected).
   */
  public async updateFields(data: UpdateTypePayload, options?: SaveOptions): Promise<Type> {
    if (this.status === TYPE_STATUSES.ARCHIVED) {
      throw new CustomError({
        statusCode: 409,
        message: "Cannot modify an archived type.",
      });
    }

    const updatedFields: string[] = [];

    if (setIfChanged(this, "display_name", data.displayName, false)) updatedFields.push("display_name");
    if (setIfChanged(this, "description", data.description, false)) updatedFields.push("description");
    if (setIfChanged(this, "color_theme", data.colorTheme, false)) updatedFields.push("color_theme");
    if (setIfChanged(this, "icon_url", data.iconUrl, false)) updatedFields.push("icon_url");
    if (setIfChanged(this, "card_image_url", data.cardImageUrl, false)) updatedFields.push("card_image_url");
    if (setIfChanged(this, "background_image_url", data.backgroundImageUrl, false))
      updatedFields.push("background_image_url");

    if (updatedFields.length === 0) {
      throw new CustomError({
        statusCode: 400,
        message: "No changes detected.",
      });
    }

    return await this.save({ ...options, fields: updatedFields });
  }

  /**
   * Updates the type's status.
   *
   * If the new status is the same as the current one, returns the instance
   * unchanged without saving.
   *
   * @param {TypeStatus} newStatus - The new status to set (`active`, `inactive`, or `archived`).
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<Type>} The updated `Type` instance with its `Universe` relation loaded.
   * @throws {CustomError} If the type is archived and the new status is not `archived` (409 Conflict).
   */
  public async setStatus(newStatus: TypeStatus, options?: SaveOptions): Promise<Type> {
    if (newStatus === this.status) return this;

    if (this.status === TYPE_STATUSES.ARCHIVED && newStatus !== TYPE_STATUSES.ARCHIVED) {
      throw new CustomError({
        statusCode: 409,
        message: "Cannot change status of an archived type.",
      });
    }

    const now = dayjs().toDate();

    switch (newStatus) {
      case TYPE_STATUSES.ACTIVE:
        this.status = TYPE_STATUSES.ACTIVE;
        this.deactivated_at = null;
        break;
      case TYPE_STATUSES.INACTIVE:
        this.status = TYPE_STATUSES.INACTIVE;
        this.deactivated_at = now;
        break;
      case TYPE_STATUSES.ARCHIVED:
        this.status = TYPE_STATUSES.ARCHIVED;
        this.deactivated_at = null;
        this.archived_at = now;
        break;
      default: {
        const _exhaustive: never = newStatus;
        return _exhaustive;
      }
    }

    return await this.save({ ...options, fields: ["status", "deactivated_at", "archived_at"] });
  }

  /**
   *
   */
  public async canBeFilteredByGender(): Promise<boolean> {
    const count = await this.countAllowed_genders();
    return count > 1;
  }

  /**
   * Converts the `Type` instance to its public data transfer object (DTO).
   *
   * @returns {TypePublicDTO} The public representation of the type.
   */
  public toPublicDTO(): TypePublicDTO {
    return {
      id: this.id,
      displayName: this.display_name,
      description: this.description,
      colorTheme: this.color_theme,
      iconUrl: this.icon_url,
      cardImageUrl: this.card_image_url,
      backgroundImageUrl: this.background_image_url,
      universe: this.universe?.toPublicDTO() ?? null,
      allowedGenders: this.allowed_genders?.map((g) => g.label) ?? [],
    };
  }

  /**
   * Converts the `Type` instance to its admin data transfer object (DTO).
   *
   * @returns {TypeAdminDTO} The admin representation of the type.
   */
  public toAdminDTO(): TypeAdminDTO {
    return {
      ...this.toPublicDTO(),
      label: this.label,
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
      type: DataTypes.STRING(TYPE_LABEL_MAX_LENGTH),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Label cannot be empty.",
        },
        len: {
          args: [TYPE_LABEL_MIN_LENGTH, TYPE_LABEL_MAX_LENGTH],
          msg: "Invalid label length.",
        },
        is: {
          args: labelRegex,
          msg: "Invalid label format.",
        },
      },
    },
    display_name: {
      type: DataTypes.STRING(TYPE_DISPLAY_NAME_MAX_LENGTH),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Display name cannot be empty.",
        },
        len: {
          args: [TYPE_DISPLAY_NAME_MIN_LENGTH, TYPE_DISPLAY_NAME_MAX_LENGTH],
          msg: "Invalid display name length.",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [TYPE_DESCRIPTION_MIN_LENGTH, TYPE_DESCRIPTION_MAX_LENGTH],
          msg: "Invalid description length.",
        },
      },
    },
    color_theme: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    icon_url: {
      type: DataTypes.STRING(IMAGE_URL_MAX_LENGTH),
      allowNull: false,
      validate: {
        len: {
          args: [1, IMAGE_URL_MAX_LENGTH],
          msg: "Invalid icon URL length.",
        },
        isUrl: {
          msg: "Invalid icon URL format.",
        },
      },
    },
    card_image_url: {
      type: DataTypes.STRING(IMAGE_URL_MAX_LENGTH),
      allowNull: false,
      validate: {
        len: {
          args: [1, IMAGE_URL_MAX_LENGTH],
          msg: "Invalid card image URL length.",
        },
        isUrl: {
          msg: "Invalid card image URL format.",
        },
      },
    },
    background_image_url: {
      type: DataTypes.STRING(IMAGE_URL_MAX_LENGTH),
      allowNull: false,
      validate: {
        len: {
          args: [1, IMAGE_URL_MAX_LENGTH],
          msg: "Invalid background image URL length.",
        },
        isUrl: {
          msg: "Invalid background image URL format.",
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
      type: DataTypes.ENUM(...Object.values(TYPE_STATUSES)),
      allowNull: false,
      defaultValue: TYPE_STATUSES.ACTIVE,
    },
    deactivated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    archived_at: {
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
        name: "idx_types_universe_status",
        fields: ["universe_id", "status"],
      },
    ],
  }
);

Type.beforeValidate((type: Type) => {
  if (typeof type.label === "string") {
    type.label = normalizeLabel(type.label);
  }

  if (typeof type.display_name === "string") {
    type.display_name = capitalize(type.display_name);
  }

  if (typeof type.description === "string") {
    type.description = type.description.trim();
  }

  if (typeof type.icon_url === "string") {
    type.icon_url = type.icon_url.trim();
  }

  if (typeof type.card_image_url === "string") {
    type.card_image_url = type.card_image_url.trim();
  }

  if (typeof type.background_image_url === "string") {
    type.background_image_url = type.background_image_url.trim();
  }
});
