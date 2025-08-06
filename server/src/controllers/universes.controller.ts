import UniverseService from "@/services/universes.service.js";
import catchAsync from "@/utils/catchAsync.js";

import type { CreateUniverseData, UpdateUniverseData } from "@/types/universes.types.js";
import type { Request, Response } from "express";

/**
 * Retrieves the list of all universes.
 */
export const getUniverses = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const universes = await UniverseService.findAllUniverses();

  return res.status(200).json({
    success: true,
    data: { universes },
  });
});

/**
 * Retrieves a specific universe by its ID.
 */
export const getUniverse = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const universeId = Number(req.params.id);

  const universe = await UniverseService.findUniverseById(universeId);

  return res.status(200).json({
    success: true,
    data: { universe },
  });
});

/**
 * Creates a new universe.
 */
export const createUniverse = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: CreateUniverseData = req.body;

  const universe = await UniverseService.createUniverse(data);

  return res.status(200).json({
    success: true,
    message: "Universe created successfully.",
    data: { universe },
  });
});

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
 * Deletes an existing universe.
 */
export const deleteUniverse = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const universeId = Number(req.params.id);

  await UniverseService.deleteUniverse(universeId);

  return res.sendStatus(204);
});
