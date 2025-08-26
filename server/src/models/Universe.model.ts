import dayjs from "dayjs";
import { DataTypes, Model } from "sequelize";

import { UNIVERSE_STATUSES } from "@/constants/universe.constants.js";
import { sequelize } from "@/database/mysql.database.js";
import CustomError from "@/utils/CustomError.utils.js";
import { toDateOnly, toTimeOnly } from "@/utils/date.utils.js";
import setIfChanged from "@/utils/set-if-changed.utils.js";
import { labelRegex } from "@/validators/patterns.js";

import type {
  UniverseAdminDTO,
  UniversePublicDTO,
  UniverseStatus,
  UpdateUniverseData,
} from "@/types/universes.types.js";
import { capitalize, normalizeLabel } from "@/utils/string.utils";
import type { SaveOptions } from "sequelize";

export const LABEL_MIN = 2;
export const LABEL_MAX = 50;

export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 100;

export const DESCRIPTION_MIN = 20;
export const DESCRIPTION_MAX = 500;

/**
 * The `Universe` entity represents a fictional or thematic world
 * used to categorize names by genre or narrative setting.
 *
 * Examples include fantasy realms, medieval worlds, science fiction universes
 * or divine pantheons.
 *
 * Fields :
 * - `label`: Short unique identifier (e.g., "fantasy", "sci_fi", "medieval").
 * - `display_name`: User-facing name (e.g., "Fantasy", "Science Fiction", "Medieval" ).
 * - `description`: Optional text to describe the lore or characteristics of the universe.
 * - `status` ("active" | "inactive" | "archived"): Lifecycle state of the universe.
 *     - `active`: visible and usable
 *     - `inactive`: hidden but can be reactivated
 *     - `archived`: locked, no longer modifiable
 * - `created_at`: Automatic creation timestamp.
 * - `updated_at`: Automatic update timestamp.
 * - `deactivated_at`: When the universe was set to inactive (nullable).
 * - `archived_at`: When the universe was archived (nullable).
 */
export default class Universe extends Model {
  declare id: number;
  declare label: string;
  declare display_name: string;
  declare description: string | null;
  declare status: UniverseStatus;
  declare created_at: Date;
  declare updated_at: Date;
  declare deactivated_at: Date | null;
  declare archived_at: Date | null;

  /**
   * Updates specific fields of the universe.
   *
   * Uses `setIfChanged` to compare current and new values, ensuring that
   * only fields whose values have actually changed are persisted.
   *
   * @param {UpdateUniverseData} data - The new data to apply.
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<Universe>} The updated `Universe` instance.
   * @throws {CustomError} If:
   *   - No fields were modified (400 No changes detected).
   */
  public async updateFields(data: UpdateUniverseData, options?: SaveOptions): Promise<Universe> {
    const updatedFields: string[] = [];

    if (setIfChanged(this, "display_name", data.displayName, false)) updatedFields.push("display_name");
    if (setIfChanged(this, "description", data.description, false)) updatedFields.push("description");

    if (updatedFields.length === 0) {
      throw new CustomError({
        statusCode: 400,
        message: "No changes detected.",
      });
    }

    return await this.save({ ...options, fields: updatedFields });
  }

  /**
   * Updates the universe's status.
   *
   * If the new status is the same as the current one, returns the instance
   * unchanged without saving.
   *
   * @param {UniverseStatus} newStatus - The new status to set (`active`, `inactive`, or `archived`).
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<Universe>} The updated `Universe` instance.
   * @throws {CustomError} If:
   *   - The universe is archived and the new status is not `archived` (status cannot be changed once archived).
   */
  public async setStatus(newStatus: UniverseStatus, options?: SaveOptions): Promise<Universe> {
    if (newStatus === this.status) return this;

    if (this.status === UNIVERSE_STATUSES.ARCHIVED && newStatus !== UNIVERSE_STATUSES.ARCHIVED) {
      throw new CustomError({
        statusCode: 422,
        message: "Cannot change status of an archived universe.",
      });
    }

    const now = dayjs().toDate();

    switch (newStatus) {
      case UNIVERSE_STATUSES.ACTIVE:
        this.status = UNIVERSE_STATUSES.ACTIVE;
        this.deactivated_at = null;
        break;
      case UNIVERSE_STATUSES.INACTIVE:
        this.status = UNIVERSE_STATUSES.INACTIVE;
        this.deactivated_at = now;
        break;
      case UNIVERSE_STATUSES.ARCHIVED:
        this.status = UNIVERSE_STATUSES.ARCHIVED;
        this.deactivated_at = null;
        this.archived_at = now;
        break;
      default: {
        const _exhaustive: never = newStatus;
        return _exhaustive;
      }
    }

    await this.save({ ...options, fields: ["status", "deactivated_at", "archived_at"] });

    return this;
  }

  /**
   * Converts the `Universe` instance to its public data transfer object (DTO).
   *
   * @returns {UniversePublicDTO} The public representation of the universe.
   */
  public toPublicDTO(): UniversePublicDTO {
    return {
      id: this.id,
      label: this.label,
      displayName: this.display_name,
      description: this.description,
    };
  }

  /**
   * Converts the `Universe` instance to its admin data transfer object (DTO).
   *
   * @returns {UniverseAdminDTO} The admin representation of the universe.
   */
  public toAdminDTO(): UniverseAdminDTO {
    return {
      ...this.toPublicDTO(),
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
      allowNull: false,
      validate: {
        len: {
          args: [DESCRIPTION_MIN, DESCRIPTION_MAX],
          msg: `The description must be between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX} characters long.`,
        },
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(UNIVERSE_STATUSES)),
      allowNull: false,
      defaultValue: UNIVERSE_STATUSES.ACTIVE,
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
    modelName: "Universe",
    tableName: "universes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "idx_universes_status_display ",
        fields: ["status", "display_name"],
      },
    ],
    defaultScope: {
      order: [["display_name", "ASC"]],
    },
  }
);

Universe.beforeValidate((universe: Universe) => {
  if (typeof universe.label === "string") {
    universe.label = normalizeLabel(universe.label);
  }

  if (typeof universe.display_name === "string") {
    universe.display_name = capitalize(universe.display_name);
  }

  if (typeof universe.description === "string") {
    universe.description = universe.description.trim();
  }
});
