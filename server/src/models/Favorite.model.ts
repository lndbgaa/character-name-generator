import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.database.js";
import CustomError from "@/utils/CustomError.utils.js";
import setIfChanged from "@/utils/set-if-changed.utils.js";

import type { Name, User } from "@/models/index.js";
import type { FavoritePublicDTO } from "@/types/users/users.favorites.types.js";
import type { SaveOptions } from "sequelize";

export const NOTE_MIN = 0;
export const NOTE_MAX = 255;

/**
 * The `Favorite` entity represents a user's saved or bookmarked name.
 *
 * A user can only favorite a given name once.
 * Optionally, the user can attach a personal note to the favorite.
 *
 * Fields :
 * - `user_id`: Foreign key referencing the user who favorited the name.
 * - `name_id`: Foreign key referencing the favorited name.
 * - `note`: Optional user-defined comment about the name.
 * - `created_at`: Automatic creation timestamp.
 * - `updated_at`: Automatic update timestamp.
 */
export default class Favorite extends Model {
  declare id: string;
  declare user_id: string;
  declare name_id: string;
  declare note: string | null;
  declare created_at: Date;
  declare updated_at: Date;

  declare user?: User;
  declare name?: Name;

  /**
   * Updates the favorite's note.
   *
   * @param {string} note - The new note to set.
   * @param {SaveOptions} [options] - Additional Sequelize save options (e.g., includes).
   * @returns {Promise<Favorite>} The updated `Favorite` instance.
   * @throws {CustomError} If:
   *   - No changes were detected (400 Bad Request).
   */
  public async setNote(note: string, options?: SaveOptions): Promise<Favorite> {
    if (setIfChanged(this, "note", note, true)) {
      return await this.save({ ...options, fields: ["note"] });
    } else {
      throw new CustomError({
        statusCode: 400,
        message: "No changes detected.",
      });
    }
  }

  /**
   * Converts the `Favorite` instance to its public data transfer object (DTO).
   *
   * @returns {FavoritePublicDTO} The public representation of the favorite.
   */
  public toPublicDTO(): FavoritePublicDTO {
    return {
      id: this.id,
      name: this.name?.value ?? null,
      note: this.note,
    };
  }
}

Favorite.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    name_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "names", key: "id" },
      onDelete: "CASCADE",
    },
    note: {
      type: DataTypes.STRING(NOTE_MAX),
      allowNull: true,
      validate: {
        len: {
          args: [NOTE_MIN, NOTE_MAX],
          msg: "Invalid note length.",
        },
      },
    },
  },
  {
    sequelize,
    modelName: "Favorites",
    tableName: "favorites",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "uniq_favorites_user_name",
        unique: true,
        fields: ["user_id", "name_id"],
      },
    ],
  }
);

Favorite.beforeValidate((favorite: Favorite) => {
  if (typeof favorite.note === "string" && favorite.note.trim().length > 0) {
    favorite.note = favorite.note.trim();
  } else {
    favorite.note = null;
  }
});
