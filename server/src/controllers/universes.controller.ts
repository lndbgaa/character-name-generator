import UniverseService from "@/services/universes.service.js";
import catchAsync from "@/utils/catch-async.utils.js";

import type { CreateUniverseData, UpdateUniverseData } from "@/types/universes.types.js";
import type { Request, Response } from "express";

// ─────────────────────────────────────────────────────────────
//  READ
// ─────────────────────────────────────────────────────────────

/**
 * Retrieves a specific universe by its ID.
 */
export const getUniverse = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const universeId = Number(req.params.id);
  const userRole = req.user?.role;

  const isAdmin = userRole === "admin";

  const universe = await UniverseService.findUniverseById(universeId, {
    where: isAdmin ? undefined : { status: "active" },
  });

  return res.status(200).json({
    success: true,
    data: { universe: isAdmin ? universe.toAdminDTO() : universe.toPublicDTO() },
  });
});

/**
 * Retrieves the list of all universes.
 */
export const getUniverses = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userRole = req.user?.role;

  const isAdmin = userRole === "admin";

  const universes = await UniverseService.findAllUniverses({
    where: isAdmin ? undefined : { status: "active" },
  });

  const dtos = universes.map((u) => (isAdmin ? u.toAdminDTO() : u.toPublicDTO()));

  return res.status(200).json({
    success: true,
    data: { universes: dtos },
  });
});

// ─────────────────────────────────────────────────────────────
//  CREATE
// ─────────────────────────────────────────────────────────────

/**
 * Creates a new universe.
 */
export const createUniverse = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: CreateUniverseData = req.body;

  const universe = await UniverseService.createUniverse(data);

  return res.status(201).json({
    success: true,
    message: "Universe created successfully.",
    data: { universe },
  });
});

// ─────────────────────────────────────────────────────────────
//  UPDATE
// ─────────────────────────────────────────────────────────────

/**
 * Updates an existing universe.
 */
export const updateUniverse = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const universeId = Number(req.params.id);
  const data: UpdateUniverseData = req.body;

  const universe = await UniverseService.updateUniverse(universeId, data);

  return res.status(200).json({
    success: true,
    message: "Universe updated successfully.",
    data: { universe },
  });
});

/**
 * Activates a universe.
 */
export const activateUniverse = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const universeId = Number(req.params.id);

  const universe = await UniverseService.activateUniverse(universeId);

  return res.status(200).json({
    success: true,
    message: "Universe successfully activated.",
    data: { universe: universe.toAdminDTO() },
  });
});

/**
 * Deactivates a universe.
 */
export const deactivateUniverse = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const universeId = Number(req.params.id);

  const universe = await UniverseService.deactivateUniverse(universeId);

  return res.status(200).json({
    success: true,
    message: "Universe successfully deactivated.",
    data: { universe: universe.toAdminDTO() },
  });
});

/**
 * Archives a universe.
 */
export const archiveUniverse = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const universeId = Number(req.params.id);

  const universe = await UniverseService.archiveUniverse(universeId);

  return res.status(200).json({
    success: true,
    message: "Universe successfully archived.",
    data: { universe: universe.toAdminDTO() },
  });
});
