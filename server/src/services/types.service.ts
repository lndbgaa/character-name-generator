import { Type } from "@/models/index.js";
import UniverseService from "@/services/universes.service.js";
import CustomError from "@/utils/CustomError.utils.js";

import type { CreateTypeData, UpdateTypeData } from "@/types/types.types.js";
import type { FindOptions, WhereOptions } from "sequelize";

class TypeService {
  /**
   * Checks if a given type label is unique (case-insensitive).
   *
   * @param {string} label - The technical label of the type to validate.
   * @throws {CustomError} - If a type with the same label already exists (409 Conflict).
   * @returns {Promise<void>}
   */
  public static async assertTypeLabelIsUnique(label: string): Promise<void> {
    const cleanLabel = label.trim().toLowerCase();

    const type = await Type.findOne({ where: { label: cleanLabel } });

    if (type) {
      throw new CustomError({
        statusCode: 409,
        message: `A type with label "${cleanLabel}" already exists.`,
      });
    }
  }

  /**
   * Retrieves a type by its numeric ID.
   *
   * @param {number} id - The unique ID of the type to retrieve.
   * @param {FindOptions} [options] - Additional Sequelize find options (e.g., includes).
   * @returns {Promise<Type>} - The found type instance.
   * @throws {CustomError} - If no type is found with the provided ID (404 Not Found).
   */
  public static async findTypeById(id: number, options?: FindOptions): Promise<Type> {
    const mergedWhere: WhereOptions = { ...(options?.where ?? {}), id };

    const type = await Type.findOne({
      ...options,
      where: mergedWhere,
      include: [{ association: "universe" }],
    });

    if (!type) {
      throw new CustomError({
        statusCode: 404,
        message: "No type found with the provided ID.",
        details: { id },
      });
    }

    return type;
  }

  /**
   * Retrieves all types from the database, optionally filtered by universe.
   *
   * @param {number} [universeId] - Optional universe ID to filter types.
   * @param {FindOptions} [options] - Additional Sequelize find options (e.g., includes).
   * @returns {Promise<Type[]>} - An array of Type instances, each including its associated universe.
   * @throws {CustomError} - If the provided universe ID does not correspond to any existing universe (404 Not Found).
   */
  public static async findAllTypes(universeId?: number, options?: FindOptions): Promise<Type[]> {
    if (universeId !== undefined) {
      await UniverseService.findUniverseById(universeId);
    }

    const mergedWhere: WhereOptions = {
      ...(options?.where ?? {}),
      ...(universeId !== undefined ? { universe_id: universeId } : {}),
    };

    return Type.findAll({
      ...options,
      where: mergedWhere,
      include: [{ association: "universe" }],
      order: options?.order ?? [["display_name", "ASC"]],
    });
  }

  /**
   * Creates a new type.
   *
   * @param {CreateTypeData} data - The data required to create the type.
   * @returns {Promise<Type>} - The newly created type instance.
   * @throws {CustomError} - If the universe does not exist (404 Not Found) or the label already exists (409 Conflict).
   */
  public static async createType(data: CreateTypeData): Promise<Type> {
    const { universeId, label, displayName, description, iconUrl } = data;

    const universe = await UniverseService.findUniverseById(universeId);

    await this.assertTypeLabelIsUnique(label);

    const type = await Type.create({
      universe_id: universe.id,
      label,
      display_name: displayName,
      description,
      icon_url: iconUrl,
    });

    await type.reload({ include: [{ association: "universe" }] });

    return type;
  }

  /**
   * Updates an existing type.
   *
   * @param {number} id - The unique ID of the type to update.
   * @param {UpdateTypeData} data - The fields to update, such as universe ID, display name, description, or icon URL.
   * @returns {Promise<Type>} - The updated `Type` instance.
   * @throws {CustomError} - If the type does not exist (404 Not Found) or the new universe ID is invalid (404 Not Found).
   */
  public static async updateType(id: number, data: UpdateTypeData): Promise<Type> {
    const type = await this.findTypeById(id);

    if (type.status === "archived") {
      throw new CustomError({
        statusCode: 422,
        message: "Cannot modify an archived type.",
      });
    }

    if (data.universeId) {
      await UniverseService.findUniverseById(data.universeId);
    }

    return type.updateFields(data);
  }

  /**
   * Activates a type by setting its status to "active".
   *
   * @param {number} id - The unique ID of the type to activate.
   * @returns {Promise<Type>} The updated `Type` instance with status set to "active".
   * @throws {CustomError} If:
   *    - No type is found with the provided ID.
   */
  public static async activateType(id: number): Promise<Type> {
    const type = await this.findTypeById(id);
    return type.setStatus("active");
  }
  /**
   * Deactivates a type by setting its status to "inactive".
   *
   * @param {number} id - The unique ID of the type to deactivate.
   * @returns {Promise<Type>} The updated `Type` instance with status set to "inactive".
   * @throws {CustomError} If:
   *    - No type is found with the provided ID.
   */
  public static async deactivateType(id: number): Promise<Type> {
    const type = await this.findTypeById(id);
    return type.setStatus("inactive");
  }

  /**
   * Archives a type by setting its status to "archived".
   *
   * @param {number} id - The unique ID of the type to archive.
   * @returns {Promise<Type>} The updated `Type` instance with status set to "archived".
   * @throws {CustomError} If:
   *    - No type is found with the provided ID.
   */
  public static async archiveType(id: number): Promise<Type> {
    const type = await this.findTypeById(id);
    return type.setStatus("archived");
  }
}

export default TypeService;
