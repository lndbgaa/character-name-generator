import UserService from "@/services/users/users.service.js";
import catchAsync from "@/utils/catch-async.utils.js";
import parsePagination from "@/utils/parse-pagination.utils.js";

import type {
  GetUsersFilters,
  GetUserSortOptions,
  GetUsersQuery,
} from "@/types/users/user.types.js";
import type { Request, Response } from "express";

/**
 * Retrieves a paginated list of users, optionally filtered and sorted by given criteria.
 */
export const getUsers = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { search, role, status, sortBy, sortDir } = req.query as GetUsersQuery;

  const filters: GetUsersFilters = { search, role, status };

  const sortOptions: GetUserSortOptions = {
    sort: sortBy ?? "created_at",
    dir: sortDir === "asc" ? "ASC" : "DESC",
  };

  const { page, limit, offset } = parsePagination(req);

  const { count, users } = await UserService.findUsers(limit, offset, sortOptions, filters);

  const totalPages = Math.ceil(count / limit);

  const dtos = users.map((u) => u.toAdminDTO());

  return res.status(200).json({
    success: true,
    data: {
      users: dtos,
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
 * Suspend a user account.
 */
export const suspendUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { id: userId } = req.params;

  const user = await UserService.suspendUser(userId);

  return res.status(200).json({
    success: true,
    message: "User account suspended successfully.",
    data: { user: user.toAdminDTO() },
  });
});

/**
 * Reactivate a suspended user account.
 */
export const reactivateUser = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { id: userId } = req.params;

  const user = await UserService.reactivateUser(userId);

  return res.status(200).json({
    success: true,
    message: "User account reactivated successfully.",
    data: { user: user.toAdminDTO() },
  });
});
