import { DEFAULT_RANDOM_NAMES, MAX_RANDOM_NAMES } from "@/constants/name.constants.js";

import NameService from "@/services/names.service.js";
import catchAsync from "@/utils/catch-async.utils.js";
import CustomError from "@/utils/CustomError.utils.js";
import parsePagination from "@/utils/parse-pagination.utils.js";

import type { MulterRequest } from "@/types/config.types.js";
import type {
  CreateNamePayload,
  GenerateNamesFilters,
  GenerateRandomNamesQuery,
  GetNamesFilters,
  GetNamesQuery,
  GetNamesSortOptions,
  UpdateNamePayload,
} from "@/types/names.types.js";
import type { Request, Response } from "express";

// ─────────────────────────────────────────────────────────────
//  READ
// ─────────────────────────────────────────────────────────────

/**
 * Retrieves a single name by its ID.
 */
export const getName = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { id: nameId } = req.params;
  const userRole = req.user?.role;

  const name = await NameService.findNameById(nameId);

  return res.status(200).json({
    success: true,
    data: {
      name: userRole === "admin" ? name.toAdminDTO() : name.toPublicDTO(),
    },
  });
});

/**
 * Retrieves a paginated list of names, optionally filtered and sorted by given criteria.
 */
export const getNames = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { search, typeLabel, genderLabel, length, charLength, status, sortBy, sortDir }: GetNamesQuery =
    req.query;

  const filters: GetNamesFilters = { search, typeLabel, genderLabel, charLength, length, status };

  const sortOptions: GetNamesSortOptions = {
    sort: sortBy ?? "created_at",
    dir: sortDir === "asc" ? "ASC" : "DESC",
  };

  const { limit, offset, page } = parsePagination(req);

  const { count, names } = await NameService.findNames(limit, offset, sortOptions, filters);

  const totalPages = Math.ceil(count / limit);

  const dtos = names.map((n) => n.toAdminDTO());

  return res.status(200).json({
    success: true,
    data: {
      names: dtos,
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
 * Generates and returns random names for a given type with optional filters (gender, length...).
 */
export const generateRandomNamesByType = catchAsync(
  async (req: Request, res: Response): Promise<Response> => {
    const typeId = Number(req.params.id);

    const { size, genderLabel, length, charLength }: GenerateRandomNamesQuery = req.query;

    const filters: GenerateNamesFilters = { genderLabel, charLength, length };

    const parsedSize = Math.min(Math.max(Number(size) || DEFAULT_RANDOM_NAMES, 1), MAX_RANDOM_NAMES);

    const names = await NameService.generateRandomNamesFromType(typeId, parsedSize, filters);

    const dtos = names.map((n) => n.toPublicDTO());

    return res.status(200).json({
      success: true,
      data: {
        names: dtos,
        total: names.length,
      },
    });
  }
);

// ─────────────────────────────────────────────────────────────
//  CREATE
// ─────────────────────────────────────────────────────────────

/**
 * Creates a new character name from the provided data.
 */
export const createName = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: CreateNamePayload = req.body;

  const name = await NameService.createName(data);

  return res.status(201).json({
    success: true,
    message: "Name created successfully.",
    data: { name: name.toAdminDTO() },
  });
});

/**
 * Creates multiple names from a JSON array.
 */
export const bulkCreateNames = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const data: CreateNamePayload[] = req.body;

  const { created, skipped, failed } = await NameService.validateAndCreateNames(data);

  const dtos = created.map((n) => n.toAdminDTO());

  const message =
    created.length === 0
      ? "No names created."
      : created.length === 1
      ? "1 name successfully created."
      : `${created.length} names successfully created.`;

  return res.status(201).json({
    success: true,
    message,
    data: {
      names: dtos,
      skipped,
      failed,
    },
  });
});

/**
 * Imports and creates names from an uploaded JSON file.
 */
export const importNamesFromFile = catchAsync(
  async (req: MulterRequest, res: Response): Promise<Response> => {
    const { file } = req;

    if (!file) {
      throw new CustomError({
        statusCode: 400,
        message: "No file selected. Please choose a file to upload.",
      });
    }

    const { created, skipped, failed } = await NameService.importFromJsonBuffer(file.buffer);

    const dtos = created.map((n) => n.toAdminDTO());

    const message =
      created.length === 0
        ? "No names imported from file."
        : created.length === 1
        ? "1 name successfully imported from file."
        : `${created.length} names successfully imported from file.`;

    return res.status(201).json({
      success: true,
      message,
      data: {
        names: dtos,
        skipped,
        failed,
      },
    });
  }
);

// ─────────────────────────────────────────────────────────────
//  UPDATE
// ─────────────────────────────────────────────────────────────

/**
 * Updates a name's value, type or gender by its ID.
 */
export const updateName = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { id: nameId } = req.params;
  const data: UpdateNamePayload = req.body;

  const name = await NameService.updateName(nameId, data);

  return res.status(200).json({
    success: true,
    message: "Name updated successfully.",
    data: { name: name.toAdminDTO() },
  });
});

/**
 * Activates a name.
 */
export const activateName = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { id: nameId } = req.params;

  const name = await NameService.activateName(nameId);

  return res.status(200).json({
    success: true,
    message: "Name successfully activated.",
    data: { name: name.toAdminDTO() },
  });
});

/**
 * Deactivates a name.
 */
export const deactivateName = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { id: nameId } = req.params;

  const name = await NameService.deactivateName(nameId);

  return res.status(200).json({
    success: true,
    message: "Name successfully deactivated.",
    data: { name: name.toAdminDTO() },
  });
});

/**
 * Archives a name.
 */
export const archiveName = catchAsync(async (req: Request, res: Response): Promise<Response> => {
  const { id: nameId } = req.params;

  const name = await NameService.archiveName(nameId);

  return res.status(200).json({
    success: true,
    message: "Name successfully archived.",
    data: { name: name.toAdminDTO() },
  });
});
