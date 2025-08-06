import { Type } from "@/models/index.js";
import UniverseService from "@/services/universes.service.js";
import CustomError from "@/utils/CustomError.js";

import type { CreateTypeData, UpdateTypeData } from "@/types/types.types.js";
import type { FindOptions } from "sequelize";

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
    const type = await Type.findByPk(id, options);

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
   * @returns {Promise<Type[]>} - An array of Type instances, each including its associated universe.
   * @throws {CustomError} - If the provided universe ID does not correspond to any existing universe (404 Not Found).
   */
  public static async findAllTypes(universeId?: number): Promise<Type[]> {
    const where: any = {};

    if (universeId) {
      await UniverseService.findUniverseById(universeId);

      where.universe_id = universeId;
    }

    return Type.findAll({
      where,
      include: [{ association: "universe" }],
      order: [["display_name", "ASC"]],
    });
  }

  /**
   * Creates a new type.
   *
   * @param {CreateTypeData} data - The data used to create the type.
   * @returns {Promise<Type>} - The newly created type instance, including its associated universe.
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
   * @returns {Promise<Type>} - The updated type instance, including its associated universe.
   * @throws {CustomError} - If the type does not exist (404 Not Found) or the new universe ID is invalid (404 Not Found).
   */
  public static async updateType(id: number, data: UpdateTypeData): Promise<Type> {
    const type = await this.findTypeById(id);

    if (data.universeId) {
      await UniverseService.findUniverseById(data.universeId);
    }

    return type.updateInfo(data);
  }

  /**
   * Deletes an existing type.
   *
   * @param {number} id - The unique ID of the type to delete.
   * @returns {Promise<void>}
   * @throws {CustomError} - If no type is found with the provided ID (404 Not Found).
   */
  public static async deleteType(id: number): Promise<void> {
    const type = await this.findTypeById(id);
    await type.destroy();
  }
}

export default TypeService;
