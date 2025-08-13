import dayjs from "dayjs";
import { DataTypes, Model } from "sequelize";

import { NAME_LENGTHS, NAME_STATUSES } from "@/constants/name.constants.js";
import { sequelize } from "@/database/mysql.js";
import CustomError from "@/utils/CustomError.utils.js";
import { toDateOnly, toTimeOnly } from "@/utils/date.utils.js";
import setIfChanged from "@/utils/set-if-changed.utils.js";
import { nameRegex } from "@/validators/patterns.js";

import type { Gender, Type } from "@/models/index.js";
import type {
  NameAdminDTO,
  NameLength,
  NamePublicDTO,
  NameStatus,
  UpdateNameData,
} from "@/types/names.types.js";
import type { SaveOptions } from "sequelize";

export const VALUE_MIN = 2;
export const VALUE_MAX = 100;

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
 * - `value`: the actual character name (e.g., "Thalor", "Xenara")
 * - `type_id`: foreign key linking to the "Type" model
 * - `gender_id`: foreign key linking to the "Gender" model
 * - `length`: enum defining name size ("short", "medium", "long")
 * - `status` ("active" | "inactive" | "archived"): Lifecycle state of the name
 *     - `active`: name is visible and can be used
 *     - `inactive`: name is hidden but may be reactivated
 *     - `archived`: name is locked and no longer modifiable
 * - `created_at`: automatic creation timestamp
 * - `updated_at`: automatic update timestamp
 * - `deactivated_at`: timestamp when the name was set to inactive (nullable)
 * - `archived_at`: timestamp when the name was archived (nullable)
 */
export default class Name extends Model {
  declare id: string;
  declare value: string;
  declare type_id: number;
  declare gender_id: number;
  declare length: NameLength;
  declare status: NameStatus;
  declare created_at: Date;
  declare updated_at: Date;
  declare archived_at: Date | null;
  declare deactivated_at: Date | null;

  declare type?: Type;
  declare gender?: Gender;

  /**
   *
   * @param data
   * @param options
   * @returns
   */
  public async updateFields(data: UpdateNameData, options?: SaveOptions): Promise<Name> {
    const updatedFields: string[] = [];

    if (setIfChanged(this, "value", data.value, false)) {
      updatedFields.push("value");
      updatedFields.push("length");
    }

    if (setIfChanged(this, "type_id", data.typeId, false)) updatedFields.push("type_id");
    if (setIfChanged(this, "gender_id", data.genderId, false)) updatedFields.push("gender_id");

    if (updatedFields.length === 0) {
      throw new CustomError({
        statusCode: 400,
        message: "No changes detected.",
      });
    }

    await this.save({ ...options, fields: updatedFields });

    return await this.reload({
      include: [{ association: "type" }, { association: "gender" }],
      transaction: options?.transaction,
    });
  }

  /**
   *
   * @param newStatus
   * @param options
   * @returns
   */
  public async setStatus(newStatus: NameStatus, options?: SaveOptions): Promise<Name> {
    if (this.status === newStatus) {
      return await this.reload({
        include: [{ association: "type" }, { association: "gender" }],
        transaction: options?.transaction,
      });
    }

    if (this.status === NAME_STATUSES.ARCHIVED && newStatus !== NAME_STATUSES.ARCHIVED) {
      throw new CustomError({
        statusCode: 422,
        message: "Cannot change status of an archived name.",
      });
    }

    const now = dayjs().toDate();

    switch (newStatus) {
      case NAME_STATUSES.ACTIVE:
        this.status = NAME_STATUSES.ACTIVE;
        this.deactivated_at = null;
        break;
      case NAME_STATUSES.INACTIVE:
        this.status = NAME_STATUSES.INACTIVE;
        this.deactivated_at = now;
        break;
      case NAME_STATUSES.ARCHIVED:
        this.status = NAME_STATUSES.ARCHIVED;
        this.deactivated_at = null;
        this.archived_at = now;
        break;
      default: {
        const _exhaustive: never = newStatus;
        return _exhaustive;
      }
    }

    await this.save({ ...options, fields: ["status", "deactivated_at", "archived_at"] });

    return await this.reload({
      include: [{ association: "type" }, { association: "gender" }],
      transaction: options?.transaction,
    });
  }

  /**
   *
   * @returns
   */
  public toPublicDTO(): NamePublicDTO {
    return {
      id: this.id,
      value: this.value,
      type: this.type?.label ?? null,
      gender: this.gender?.label ?? null,
      length: this.length,
    };
  }

  /**
   *
   * @returns
   */
  public toAdminDTO(): NameAdminDTO {
    return {
      id: this.id,
      value: this.value,
      length: this.length,
      status: this.status,
      type: this.type
        ? {
            id: this.type.id,
            label: this.type.label,
            displayName: this.type.display_name,
          }
        : null,
      gender: this.gender
        ? {
            id: this.gender.id,
            label: this.gender.label,
            displayName: this.gender.display_name,
          }
        : null,
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

Name.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    value: {
      type: DataTypes.STRING(VALUE_MAX),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "The name cannot be empty.",
        },
        len: {
          args: [VALUE_MIN, VALUE_MAX],
          msg: `The name must be between ${VALUE_MIN} and ${VALUE_MAX} characters long.`,
        },
        is: {
          args: nameRegex,
          msg: "The name must start with a letter and may only contain letters, spaces, hyphens (-), or apostrophes (’ or ').",
        },
      },
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
      type: DataTypes.ENUM(...Object.values(NAME_LENGTHS)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(NAME_STATUSES)),
      allowNull: false,
      defaultValue: NAME_STATUSES.ACTIVE,
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
    modelName: "Name",
    tableName: "names",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "uniq_names_value_type",
        unique: true,
        fields: ["value", "type_id"],
      },
      {
        name: "idx_names_status",
        fields: ["status"],
      },
      {
        name: "idx_names_type",
        fields: ["type_id"],
      },
    ],
  }
);

Name.beforeValidate((name: Name) => {
  if (typeof name.value === "string") {
    const trimmed = name.value.trim();

    if (trimmed.length > 0) {
      name.value = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

      const length = trimmed.length;

      if (length >= 9) {
        name.length = NAME_LENGTHS.LONG;
      } else if (length >= 6) {
        name.length = NAME_LENGTHS.MEDIUM;
      } else {
        name.length = NAME_LENGTHS.SHORT;
      }
    }
  }
});
