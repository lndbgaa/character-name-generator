import TypeService from "@/services/types.service.js";
import catchAsync from "@/utils/catch-async.utils.js";

import type { CreateTypePayload, UpdateTypePayload } from "@/types/types.types.js";
import type { Request, Response } from "express";

// ─────────────────────────────────────────────────────────────
//  READ
// ─────────────────────────────────────────────────────────────

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

  const dto = isAdmin ? type.toAdminDTO() : type.toPublicDTO();

  return res.status(200).json({
    success: true,
    data: { type: dto },
  });
});

/**
 * Retrieves a list of types, optionally filtered by universe.
 */
export const getTypes = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const universeLabel = typeof req.query.universe === "string" ? req.query.universe : undefined;
  const userRole = req.user?.role;

  const isAdmin = userRole === "admin";

  const types = await TypeService.findTypes(universeLabel, {
    where: isAdmin ? undefined : { status: "active" },
  });

  const dtos = types.map((t) => (isAdmin ? t.toAdminDTO() : t.toPublicDTO()));

  return res.status(200).json({
    success: true,
    data: { types: dtos },
  });
});

// ─────────────────────────────────────────────────────────────
//  CREATE
// ─────────────────────────────────────────────────────────────

/**
 * Creates a new type.
 */
export const createType = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: CreateTypePayload = req.body;

  const type = await TypeService.createType(data);

  const dto = type.toAdminDTO();

  return res.status(201).json({
    success: true,
    message: "Type created successfully.",
    data: { type: dto },
  });
});

// ─────────────────────────────────────────────────────────────
//  UPDATE
// ─────────────────────────────────────────────────────────────

/**
 * Updates an existing type.
 */
export const updateType = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const typeId = Number(req.params.id);
  const data: UpdateTypePayload = req.body;

  const type = await TypeService.updateType(typeId, data);

  const dto = type.toAdminDTO();

  return res.status(200).json({
    success: true,
    message: "Type successfully updated.",
    data: { type: dto },
  });
});

/**
 * Activates a type.
 */
export const activateType = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const typeId = Number(req.params.id);

  const type = await TypeService.activateType(typeId);

  const dto = type.toAdminDTO();

  return res.status(200).json({
    success: true,
    message: "Type successfully activated.",
    data: { type: dto },
  });
});

/**
 * Deactivates a type.
 */
export const deactivateType = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const typeId = Number(req.params.id);

  const type = await TypeService.deactivateType(typeId);

  const dto = type.toAdminDTO();

  return res.status(200).json({
    success: true,
    message: "Type successfully deactivated.",
    data: { type: dto },
  });
});

/**
 * Archives a type.
 */
export const archiveType = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const typeId = Number(req.params.id);

  const type = await TypeService.archiveType(typeId);

  const dto = type.toAdminDTO();

  return res.status(200).json({
    success: true,
    message: "Type successfully archived.",
    data: { type: dto },
  });
});
