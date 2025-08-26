import { TYPE_STATUSES } from "@/constants/type.constants.js";
import { sequelize } from "@/database/mysql.database.js";
import { Gender, Type } from "@/models/index.js";
import UniverseService from "@/services/universes.service.js";
import CustomError from "@/utils/CustomError.utils.js";
import { capitalize, normalizeLabel } from "@/utils/string.utils.js";

import type { GenderLabel } from "@/types/gender.types";
import type { CreateTypePayload, UpdateTypePayload } from "@/types/types.types.js";
import type { FindOptions, WhereOptions } from "sequelize";

class TypeService {
  private static readonly defaultIncludes = [{ association: "universe" }, { association: "allowed_genders" }];

  /**
   * Checks if a given type label is unique (case-insensitive).
   *
   * @param {string} label - The technical label of the type to validate.
   * @returns {Promise<void>}
   * @throws {CustomError} If a type with the same label already exists (409 Conflict).
   */
  public static async assertTypeLabelIsUnique(label: string): Promise<void> {
    const normalized = normalizeLabel(label);

    const type = await Type.findOne({
      where: sequelize.where(sequelize.fn("LOWER", sequelize.col("label")), normalized),
    });

    if (type) {
      throw new CustomError({
        statusCode: 409,
        message: `A type with label "${normalized}" already exists.`,
        details: { provided: label, normalized },
      });
    }
  }

  /**
   * Checks if a given display name is unique (case-insensitive).
   *
   * @param {string} displayName - The user-facing display name of the type to validate.
   * @returns {Promise<void>}
   * @throws {CustomError} If a type with the same display name already exists (409 Conflict).
   */
  public static async assertTypeDisplayIsUnique(displayName: string): Promise<void> {
    const normalized = capitalize(displayName);

    const type = await Type.findOne({
      where: sequelize.where(sequelize.fn("LOWER", sequelize.col("display_name")), normalized.toLowerCase()),
    });

    if (type) {
      throw new CustomError({
        statusCode: 409,
        message: `A type with display name "${normalized}" already exists.`,
        details: { provided: displayName, normalized },
      });
    }
  }

  /**
   * Checks if a given gender is allowed for the specified type.
   *
   * @param {Type} type - The `Type` instance to validate against, including its allowed genders.
   * @param {GenderLabel} genderLabel - The gender label to validate (e.g., "male", "female", "neutral").
   * @returns {void}
   * @throws {CustomError} If the provided gender is not allowed for the given type (400 Bad Request).
   */
  public static assertTypeGenderIsAllowed(type: Type, genderLabel: GenderLabel): void {
    const allowed = type.allowed_genders?.map((g) => g.label) ?? [];

    if (!allowed.includes(genderLabel)) {
      throw new CustomError({
        statusCode: 400,
        message: `The gender "${genderLabel}" is not allowed for type "${type.label}".`,
        details: { allowed, provided: genderLabel },
      });
    }
  }

  /**
   * Retrieves a type by its numeric ID.
   *
   * @param {number} id - The unique ID of the type to retrieve.
   * @param {FindOptions} [options] - Additional Sequelize find options (e.g., includes).
   * @returns {Promise<Type>} - The found `Type` instance.
   * @throws {CustomError} - If no type is found with the provided ID (404 Not Found).
   */
  public static async findTypeById(id: number, options?: FindOptions): Promise<Type> {
    const where: WhereOptions = { ...options?.where, id };

    const include = [
      ...this.defaultIncludes,
      ...(Array.isArray(options?.include) ? options.include : options?.include ? [options.include] : []),
    ];

    const type = await Type.findOne({
      ...options,
      where,
      include,
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
   * Retrieves a type by its label.
   *
   * @param {string} label - The unique label of the type to retrieve.
   * @param {FindOptions} [options] - Additional Sequelize find options (e.g., includes).
   * @returns {Promise<Type>} - The found `Type` instance.
   * @throws {CustomError} - If no type is found with the provided label (404 Not Found).
   */
  public static async findTypeByLabel(label: string, options?: FindOptions): Promise<Type> {
    const normalized = normalizeLabel(label);

    const where: WhereOptions = { ...options?.where, label: normalized };

    const include = [
      ...this.defaultIncludes,
      ...(Array.isArray(options?.include) ? options.include : options?.include ? [options.include] : []),
    ];

    const type = await Type.findOne({
      ...options,
      where,
      include,
    });

    if (!type) {
      throw new CustomError({
        statusCode: 404,
        message: "No type found with the provided label.",
        details: { provided: label, normalized },
      });
    }

    return type;
  }

  /**
   * Retrieves all types from the database, optionally filtered by universe.
   *
   * @param {string} [universeLabel] - Optional universe label to filter types (e.g., "fantasy").
   * @param {FindOptions} [options] - Additional Sequelize find options (e.g., includes, order, where).
   * @returns {Promise<Type[]>} - An array of `Type` instances, each including its associated universe.
   * @throws {CustomError} - If a universe label is provided and no matching universe is found (404 Not Found).
   */
  public static async findTypes(universeLabel?: string, options?: FindOptions): Promise<Type[]> {
    const universeRecord = universeLabel ? await UniverseService.findUniverseByLabel(universeLabel) : null;

    const where: WhereOptions = {
      ...options?.where,
      ...(universeRecord && { universe_id: universeRecord.id }),
    };

    const include = [
      ...this.defaultIncludes,
      ...(Array.isArray(options?.include) ? options.include : options?.include ? [options.include] : []),
    ];

    return Type.findAll({
      ...options,
      where,
      include,
      order: options?.order ?? [["display_name", "ASC"]],
    });
  }

  /**
   * Creates a new type.
   *
   * @param {CreateTypeData} data - The data required to create the type.
   * @returns {Promise<Type>} - The newly created `Type` instance.
   * @throws {CustomError} - If
   *   - The universe does not exist (404 Not Found)
   *   - The label already exists (409 Conflict).
   *   - The display name already exists (409 Conflict).
   */
  public static async createType(data: CreateTypePayload): Promise<Type> {
    return sequelize.transaction(async (t) => {
      const universeRecord = await UniverseService.findUniverseByLabel(data.universeLabel);

      await this.assertTypeLabelIsUnique(data.label);
      await this.assertTypeDisplayIsUnique(data.displayName);

      const type = await Type.create(
        {
          universe_id: universeRecord.id,
          label: data.label,
          display_name: data.displayName,
          description: data.description,
          color_theme: data.colorTheme,
          icon_url: data.iconUrl,
          card_image_url: data.cardImageUrl,
          background_image_url: data.backgroundImageUrl,
        },
        { transaction: t }
      );

      const genders = await Gender.findAll({
        where: { label: data.allowedGenderLabels },
        transaction: t,
      });

      if (genders.length !== data.allowedGenderLabels.length) {
        const foundLabels = genders.map((g) => g.label);
        const missing = data.allowedGenderLabels.filter((l) => !foundLabels.includes(l));

        throw new CustomError({
          statusCode: 404,
          message: "One or more provided gender labels do not exist.",
          details: { missing },
        });
      }

      await type.setAllowed_genders(genders, { transaction: t });

      return type.reload({
        include: this.defaultIncludes,
        transaction: t,
      });
    });
  }

  /**
   * Updates an existing type.
   *
   * @param {number} id - The unique ID of the type to update.
   * @param {UpdateTypeData} data - The fields to update, such as universe ID, display name, description, or icon URL.
   * @returns {Promise<Type>} - The updated `Type` instance.
   * @throws {CustomError} - If:
   *   - The type does not exist (404 Not Found).
   *   - The type is archived and cannot be modified (409 Conflict).
   *   - The new display name already exists (409 Conflict).
   */
  public static async updateType(id: number, data: UpdateTypePayload): Promise<Type> {
    const type = await this.findTypeById(id);

    if (data.displayName && data.displayName !== type.display_name) {
      await this.assertTypeDisplayIsUnique(data.displayName);
    }

    await type.updateFields(data);

    return type.reload({ include: this.defaultIncludes });
  }

  /**
   * Activates a type by setting its status to "active".
   *
   * @param {number} id - The unique ID of the type to activate.
   * @returns {Promise<Type>} The updated `Type` instance with status set to "active".
   * @throws {CustomError} If no type is found with the provided ID.
   */
  public static async activateType(id: number): Promise<Type> {
    const type = await this.findTypeById(id);
    await type.setStatus(TYPE_STATUSES.ACTIVE);
    return type.reload({ include: this.defaultIncludes });
  }
  /**
   * Deactivates a type by setting its status to "inactive".
   *
   * @param {number} id - The unique ID of the type to deactivate.
   * @returns {Promise<Type>} The updated `Type` instance with status set to "inactive".
   * @throws {CustomError} If no type is found with the provided ID.
   */
  public static async deactivateType(id: number): Promise<Type> {
    const type = await this.findTypeById(id);
    await type.setStatus(TYPE_STATUSES.INACTIVE);
    return type.reload({ include: this.defaultIncludes });
  }

  /**
   * Archives a type by setting its status to "archived".
   *
   * @param {number} id - The unique ID of the type to archive.
   * @returns {Promise<Type>} The updated `Type` instance with status set to "archived".
   * @throws {CustomError} If no type is found with the provided ID.
   */
  public static async archiveType(id: number): Promise<Type> {
    const type = await this.findTypeById(id);
    await type.setStatus(TYPE_STATUSES.ARCHIVED);
    return type.reload({ include: this.defaultIncludes });
  }
}

export default TypeService;
