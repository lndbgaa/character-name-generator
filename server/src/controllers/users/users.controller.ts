import UserService from "@/services/users/users.service.js";
import catchAsync from "@/utils/catchAsync.js";

import type { Request, Response } from "express";

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
