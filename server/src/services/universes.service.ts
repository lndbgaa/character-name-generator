import { Universe } from "@/models/index.js";
import CustomError from "@/utils/CustomError.js";

import type { CreateUniverseData, UpdateUniverseData } from "@/types/universes.types.js";
import type { FindOptions } from "sequelize";

class UniverseService {
  /**
   * Checks if a given universe label is unique (case-insensitive).
   *
   * @param {string} label - The technical label of the universe to validate.
   * @throws {CustomError} - If a universe with the same label already exists (409 Conflict).
   * @returns {Promise<void>}
   */
  public static async assertUniverseLabelIsUnique(label: string): Promise<void> {
    const cleanLabel = label.trim().toLowerCase();

    const exists = await Universe.findOne({ where: { label: cleanLabel } });

    if (exists) {
      throw new CustomError({
        statusCode: 409,
        message: `A universe with label "${cleanLabel}" already exists.`,
      });
    }
  }

  /**
   * Retrieves a universe by its numeric ID.
   *
   * @param {number} id - The unique ID of the universe to retrieve.
   * @param {FindOptions} [options] - Additional Sequelize find options (e.g., includes).
   * @returns {Promise<Universe>} - The found universe instance.
   * @throws {CustomError} - If no universe is found with the provided ID (404 Not Found).
   */
  public static async findUniverseById(id: number, options?: FindOptions): Promise<Universe> {
    const universe = await Universe.findByPk(id, options);

    if (!universe) {
      throw new CustomError({
        statusCode: 404,
        message: "No universe found with the specified ID.",
        details: { id },
      });
    }

    return universe;
  }

  /**
   * Retrieves all universes from the database.
   *
   * @returns {Promise<Universe[]>} - An array of Universe instances.
   */
  public static async findAllUniverses(): Promise<Universe[]> {
    return Universe.findAll();
  }

  /**
   * Creates a new universe.
   *
   * @param {CreateUniverseData} data - The data used to create the universe.
   * @returns {Promise<Universe>} - The newly created Universe instance.
   * @throws {CustomError} - If a universe with the same label already exists (409 Conflict).
   */
  public static async createUniverse(data: CreateUniverseData): Promise<Universe> {
    const { label, displayName, description } = data;

    await this.assertUniverseLabelIsUnique(label);

    return Universe.create({
      label,
      display_name: displayName,
      description,
    });
  }

  /**
   * Updates an existing universe's information.
   *
   * @param {number} id - The unique ID of the universe to update.
   * @param {UpdateUniverseData} data - The fields to update, such as display name or description.
   * @returns {Promise<Universe>} - The updated Universe instance.
   * @throws {CustomError} - If no universe is found with the provided ID (404 Not Found) or if no changes are detected (400 Bad Request).
   */
  public static async updateUniverse(id: number, data: UpdateUniverseData): Promise<Universe> {
    const universe = await this.findUniverseById(id);
    return universe.updateInfo(data);
  }

  /**
   * Deletes an existing universe.
   *
   * @param {number} id - The unique ID of the universe to delete.
   * @returns {Promise<void>}
   * @throws {CustomError} - If no universe is found with the provided ID (404 Not Found).
   */
  public static async deleteUniverse(id: number): Promise<void> {
    const universe = await this.findUniverseById(id);
    await universe.destroy();
  }
}

export default UniverseService;
