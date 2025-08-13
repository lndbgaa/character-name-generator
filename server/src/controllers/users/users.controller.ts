import { ACCOUNT_STATUSES, USER_ALLOWED_SORT_FIELDS } from "@/constants/user.constants.js";
import UserService from "@/services/users/users.service.js";
import catchAsync from "@/utils/catch-async.utils.js";
import parsePagination from "@/utils/parse-pagination.utils.js";

import type {
  AccountStatus,
  GetUsersFilters,
  GetUserSortOptions,
  UserAllowedSort,
} from "@/types/users/user.types.js";
import type { Request, Response } from "express";

/**
 * Retrieves a paginated list of users, optionally filtered and sorted by given criteria.
 */
export const getUsers = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { search, roleId, status, sortBy, sortDir } = req.query;

  const filters: GetUsersFilters = {
    search: typeof search === "string" && search.trim().length > 0 ? search.trim() : undefined,
    roleId: roleId && Number.isFinite(Number(roleId)) ? Number(roleId) : undefined,
    status:
      typeof status === "string" && Object.values(ACCOUNT_STATUSES).includes(status as AccountStatus)
        ? (status as AccountStatus)
        : undefined,
  };

  const sortOptions: GetUserSortOptions = {
    sort:
      typeof sortBy === "string" && USER_ALLOWED_SORT_FIELDS.includes(sortBy as UserAllowedSort)
        ? (sortBy as UserAllowedSort)
        : "created_at",
    dir: typeof sortDir === "string" && sortDir.toLowerCase() === "asc" ? "ASC" : "DESC",
  };

  const { page, limit, offset } = parsePagination(req);

  const { count, users } = await UserService.findAllUsers(limit, offset, filters, sortOptions);

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
