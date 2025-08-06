import TypeService from "@/services/types.service.js";
import catchAsync from "@/utils/catchAsync.js";

import type { CreateTypeData, UpdateTypeData } from "@/types/types.types.js";
import type { Request, Response } from "express";

/**
 * Retrieves all types, optionally filtered by universe.
 */
export const getAllTypes = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const universeId = req.query.universeId ? Number(req.query.universeId) : undefined;

  const types = await TypeService.findAllTypes(universeId);

  const dtos = types.map((t) => t.toAdminDTO());

  return res.status(200).json({
    success: true,
    data: { types: dtos },
  });
});

/**
 * Retrieves a specific type by its ID.
 */
export const getType = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const typeId = Number(req.params.id);

  const type = await TypeService.findTypeById(typeId, { include: [{ association: "universe" }] });

  return res.status(200).json({
    success: true,
    data: { type: type.toAdminDTO() },
  });
});

/**
 * Creates a new type.
 */
export const createType = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: CreateTypeData = req.body;

  const type = await TypeService.createType(data);

  return res.status(200).json({
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
 * Deletes aan existing type.
 */
export const deleteType = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const typeId = Number(req.params.id);

  await TypeService.deleteType(typeId);

  return res.sendStatus(204);
});
