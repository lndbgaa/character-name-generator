import FavoriteService from "@/services/users/users.favorites.service.js";
import catchAsync from "@/utils/catch-async.utils.js";
import parsePagination from "@/utils/parse-pagination.utils.js";

import type { AddFavoriteData, UpdateFavoriteData } from "@/types/users/users.favorites.types.js";
import type { Request, Response } from "express";

/**
 * Retrieves the authenticated user's list of favorite items with pagination.
 */
export const getMyFavorites = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.id;

  const { page, limit, offset } = parsePagination(req);

  const { count, favorites } = await FavoriteService.getFavorites(userId, limit, offset);

  const totalPages = Math.ceil(count / limit);

  const dtos = favorites.map((f) => f.toPublicDTO());

  return res.status(200).json({
    success: true,
    data: {
      favorites: dtos,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNextPage: page < totalPages && totalPages > 0,
        hasPrevPage: page > 1,
      },
    },
  });
});

/**
 * Adds a new favorite item for the authenticated user.
 */
export const addFavorite = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.id;
  const data: AddFavoriteData = req.body;

  const favorite = await FavoriteService.addFavorite(userId, data);

  return res.status(201).json({
    success: true,
    message: "Favorite added successfully.",
    data: { favorite: favorite.toPublicDTO() },
  });
});

/**
 * Updates an existing favorite item for the authenticated user.
 */
export const updateFavorite = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.id;
  const { id: favoriteId } = req.params;
  const data: UpdateFavoriteData = req.body;

  const favorite = await FavoriteService.updateFavorite(userId, favoriteId, data);

  return res.status(200).json({
    success: true,
    message: "Favorite updated successfully.",
    data: { favorite: favorite.toPublicDTO() },
  });
});

/**
 * Removes a favorite item from the authenticated user's list.
 */
export const removeFavorite = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.id;
  const { id: favoriteId } = req.params;

  await FavoriteService.removeFavorite(userId, favoriteId);

  return res.sendStatus(204);
});
