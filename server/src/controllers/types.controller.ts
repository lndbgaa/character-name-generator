import TypeService from "@/services/types.service.js";
import catchAsync from "@/utils/catchAsync.js";

import type { CreateTypeData, UpdateTypeData } from "@/types/types.types.js";
import type { Request, Response } from "express";

/**
 * Retrieves a specific type by its ID.
 */
export const getType = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const typeId = Number(req.params.id);
  const userRole = req.user?.role;

  const isAdmin = userRole === "admin";

  const type = await TypeService.findTypeById(typeId, {
    where: isAdmin ? undefined : { status: "active" },
  });

  return res.status(200).json({
    success: true,
    data: { type: isAdmin ? type.toAdminDTO() : type.toPublicDTO() },
  });
});

/**
 * Retrieves all types, optionally filtered by universe.
 */
export const getAllTypes = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const universeId = req.query.universeId ? Number(req.query.universeId) : undefined;
  const userRole = req.user?.role;

  const isAdmin = userRole === "admin";

  const types = await TypeService.findAllTypes(universeId, {
    where: isAdmin ? undefined : { status: "active" },
  });

  const dtos = types.map((t) => (isAdmin ? t.toAdminDTO() : t.toPublicDTO()));

  return res.status(200).json({
    success: true,
    data: { types: dtos },
  });
});

/**
 * Creates a new type.
 */
export const createType = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: CreateTypeData = req.body;

  const type = await TypeService.createType(data);

  return res.status(201).json({
    success: true,
    message: "Type created successfully.",
    data: { type: type.toAdminDTO() },
  });
});

/**
 * Updates an existing type.
 */
export const updateType = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const typeId = Number(req.params.id);
  const data: UpdateTypeData = req.body;

  const type = await TypeService.updateType(typeId, data);

  return res.status(200).json({
    success: true,
    message: "Type updated successfully.",
    data: { type: type.toAdminDTO() },
  });
});

/**
 * Activates a type.
 */
export const activateType = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const typeId = Number(req.params.id);

  const type = await TypeService.activateType(typeId);

  return res.status(200).json({
    success: true,
    message: "Type successfully activated.",
    data: { type: type.toAdminDTO() },
  });
});

/**
 * Deactivates a type.
 */
export const deactivateType = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const typeId = Number(req.params.id);

  const type = await TypeService.deactivateType(typeId);

  return res.status(200).json({
    success: true,
    message: "Type successfully deactivated.",
    data: { type: type.toAdminDTO() },
  });
});

/**
 * Archives a type.
 */
export const archiveType = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const typeId = Number(req.params.id);

  const type = await TypeService.archiveType(typeId);

  return res.status(200).json({
    success: true,
    message: "Type successfully archived.",
    data: { type: type.toAdminDTO() },
  });
});
