import { Favorite, Name } from "@/models/index.js";
import UserService from "@/services/users/users.service.js";
import CustomError from "@/utils/CustomError.utils.js";

import type { AddFavoriteData, UpdateFavoriteData } from "@/types/users/users.favorites.types.js";

class FavoriteService {
  /**
   *
   * @param userId
   * @param limit
   * @param offset
   * @returns
   */
  public static async getFavorites(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ count: number; favorites: Favorite[] }> {
    await UserService.findUserById(userId);

    const { count, rows: favorites } = await Favorite.findAndCountAll({
      where: { user_id: userId },
      limit,
      offset,
      include: [{ association: "name" }],
    });

    return { count, favorites };
  }

  /**
   *
   * @param userId
   * @param data
   * @returns
   */
  public static async addFavorite(userId: string, data: AddFavoriteData): Promise<Favorite> {
    await UserService.findUserById(userId);

    const { nameId, note } = data;

    const nameExists = await Name.findOne({ where: { id: nameId } });
    if (!nameExists) {
      throw new CustomError({
        statusCode: 404,
        message: "The specified item does not exist.",
      });
    }

    const exists = await Favorite.findOne({ where: { user_id: userId, name_id: nameId } });
    if (exists) {
      throw new CustomError({
        statusCode: 400,
        message: "This item is already in your favorites.",
      });
    }

    const favorite = await Favorite.create({
      user_id: userId,
      name_id: nameId,
      note: note ?? null,
    });

    await favorite.reload({ include: [{ association: "name" }] });

    return favorite;
  }

  /**
   *
   * @param userId
   * @param favoriteId
   * @param data
   * @returns
   */
  public static async updateFavorite(
    userId: string,
    favoriteId: string,
    data: UpdateFavoriteData
  ): Promise<Favorite> {
    const favorite = await Favorite.findOne({
      where: { id: favoriteId, user_id: userId },
      include: [{ association: "name" }],
    });

    if (!favorite) {
      throw new CustomError({
        statusCode: 404,
        message: "Favorite not found.",
      });
    }

    const { note } = data;

    return favorite.updateNote(note);
  }

  /**
   *
   * @param userId
   * @param favoriteId
   */
  public static async removeFavorite(userId: string, favoriteId: string): Promise<void> {
    const favorite = await Favorite.findOne({ where: { id: favoriteId, user_id: userId } });

    if (!favorite) {
      throw new CustomError({
        statusCode: 404,
        message: "Favorite not found.",
      });
    }

    await favorite.destroy();
  }
}

export default FavoriteService;
