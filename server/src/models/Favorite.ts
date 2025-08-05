import { DataTypes, Model } from "sequelize";

import { sequelize } from "@/database/mysql.js";
import CustomError from "@/utils/CustomError.js";
import setIfChanged from "@/utils/setIfChanged.js";

import type { Name, User } from "@/models/index.js";
import type { FavoritePublicDTO } from "@/types/favorite.types.js";
import type { SaveOptions } from "sequelize";

/**
 * The "Favorite" entity represents a user's saved or bookmarked name.
 *
 * It acts as a many-to-many link between users and names,
 * allowing users to mark specific names as favorites.
 *
 * A user can only favorite a given name once.
 * Optionally, the user can attach a personal note to the favorite.
 *
 * Fields :
 * - `id`: UUID identifier
 * - `user_id`: foreign key referencing the user who favorited the name
 * - `name_id`: foreign key referencing the favorited name
 * - `note`: optional user-defined comment about the name
 * - `created_at`: automatic creation timestamp
 * - `updated_at`: automatic update timestamp
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

  public async updateNote(note: string, options?: SaveOptions): Promise<Favorite> {
    if (setIfChanged(this, "note", note, true)) {
      return await this.save({ ...options, fields: ["note"] });
    } else {
      throw new CustomError({
        statusCode: 400,
        message: "No changes detected.",
      });
    }
  }

  public toPublicDTO(): FavoritePublicDTO {
    return {
      id: this.id,
      name: this.name?.label || "",
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
      type: DataTypes.TEXT,
      allowNull: true,
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
      { name: "idx_favorites_user_id", fields: ["user_id"] },
    ],
  }
);
