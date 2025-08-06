import ProfileService from "@/services/users/users.profile.service.js";
import catchAsync from "@/utils/catchAsync.js";
import CustomError from "@/utils/CustomError.js";

import type { MulterRequest } from "@/types/express.d.ts";
import type { UpdateUserData } from "@/types/users/users.types";
import type { Request, Response } from "express";

/**
 * Retrieves the authenticated user's profile information.
 */
export const getMyInfo = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.id;

  const user = await ProfileService.findUserById(userId, { include: [{ association: "role" }] });

  return res.status(200).json({
    success: true,
    data: { user: user.toPrivateDTO() },
  });
});

/**
 * Updates the authenticated user's profile details with the provided data.
 */
export const updateMyProfile = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user!.id;
  const data: UpdateUserData = req.body;

  const user = await ProfileService.updateProfile(userId, data);

  return res.status(200).json({
    success: true,
    message: "Your profile has been updated successfully.",
    data: { user: user.toPrivateDTO() },
  });
});

/**
 * Updates the authenticated user's avatar with the uploaded image file.
 */
export const updateMyAvatar = catchAsync(async (req: MulterRequest, res: Response): Promise<Response> => {
  const userId = req.user!.id;

  const { file } = req;

  if (!file) {
    throw new CustomError({
      statusCode: 400,
      message: "No image selected. Please choose a file to upload.",
    });
  }

  const { url } = await ProfileService.updateAvatar(userId, file);

  return res.status(200).json({
    success: true,
    message: "Your avatar has been updated successfully.",
    data: { url },
  });
});
