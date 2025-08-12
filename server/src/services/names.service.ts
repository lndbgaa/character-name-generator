import { col, fn, Op, Sequelize, where as whereFn } from "sequelize";

import { Favorite, Name } from "@/models/index.js";
import GenderService from "@/services/genders.service.js";
import TypeService from "@/services/types.service.js";
import CustomError from "@/utils/CustomError.js";
import { createNameSchema } from "@/validators/name.schema.js";

import type {
  BulkNameResult,
  CreateNameData,
  GenerateNameFilters,
  GetNameFilters,
  UpdateNameData,
} from "@/types/names.types.js";
import type { FlexibleWhere } from "@/types/sequelize.types.js";
import type { FindOptions, WhereOptions } from "sequelize";

class NameService {
  /**
   * Retrieves a name by its unique ID.

   * @param {string} id - The unique ID of the name to retrieve.
   * @param {FindOptions} [options] - Additional Sequelize find options (e.g., includes).
   * @returns {Promise<Name>} The found `Name` instance.
   * @throws {CustomError} If:
   *   - No name is found with the provided ID.
   */
  public static async findNameById(id: string, options?: FindOptions): Promise<Name> {
    const mergedWhere: WhereOptions = {
      ...(options?.where ?? {}),
      id,
    };

    const name = await Name.findOne({
      ...options,
      where: mergedWhere,
    });

    if (!name) {
      throw new CustomError({
        statusCode: 404,
        message: "No name found with the provided ID.",
        details: { id },
      });
    }

    return name;
  }

  /**
   *
   * @param limit
   * @param offset
   * @param {NameFilters} [filters] - Optional filters to apply:
   *   - `search`: Partial name to search for (prefix match, case-insensitive).
   *   - `typeId`: Filter by associated type ID.
   *   - `genderId`: Filter by associated gender ID.
   *   - `length`: Filter by name length category (`short`, `medium`, `long`).
   *   - `charLength`: Filter by the exact number of characters in the name value.
   *   - `status`: Filter by name status (`active`, `inactive`, `archived`).
   * @returns {Promise<{ count: number; names: Name[] }>} An object containing:
   *   - `count`: Total number of matching names.
   *   - `names`: Array of matching `Name` instances.
   * @throws {CustomError} If:
   *   - Provided `typeId` or `genderId` do not exist (404 Not Found)
   */
  public static async getNames(
    limit: number,
    offset: number,
    filters?: GetNameFilters
  ): Promise<{ count: number; names: Name[] }> {
    let where: FlexibleWhere<Name> = {};

    if (filters) {
      const { search, typeId, genderId, length, charLength, status } = filters;

      if (search) {
        where[Op.and] = [
          ...(where[Op.and] ?? []),
          Sequelize.where(fn("LOWER", col("value")), { [Op.like]: `${search.toLowerCase()}%` }),
        ];
      }

      if (typeId) {
        await TypeService.findTypeById(typeId);
        where.type_id = typeId;
      }

      if (genderId) {
        await GenderService.findGenderById(genderId);
        where.gender_id = genderId;
      }

      if (length) {
        where.length = length;
      }

      if (charLength) {
        where[Op.and] = [...(where[Op.and] ?? []), whereFn(fn("CHAR_LENGTH", col("value")), { [Op.eq]: charLength })];
      }

      if (status) {
        where.status = status;
      }
    }

    const { count, rows } = await Name.findAndCountAll({
      where,
      include: [{ association: "type" }, { association: "gender" }],
      limit,
      offset,
    });

    return { count, names: rows };
  }

  /**
   * Creates a new name.
   *
   * @param {CreateNameData} data - The data required to create the name.
   * @returns {Promise<Name>} The newly created `Name` instance.
   * @throws {CustomError} If:
   *   - Provided `typeId` or `genderId` do not exist (404 Not Found).
   *   - A name with the same value and type already exists (409 Conflict).
   */
  public static async createName(data: CreateNameData): Promise<Name> {
    const { value, typeId, genderId } = data;

    await TypeService.findTypeById(typeId);
    await GenderService.findGenderById(genderId);

    const normalizedValue = value.trim();

    const length = normalizedValue.length >= 9 ? "long" : normalizedValue.length >= 6 ? "medium" : "short";

    const exists = await Name.findOne({
      where: { value: normalizedValue, type_id: typeId },
      include: [{ association: "type" }],
    });

    if (exists) {
      throw new CustomError({
        statusCode: 409,
        message: `The name "${normalizedValue}" already exists for the ${
          exists.type?.label ? `type ${exists.type?.label}` : "provided type"
        }.`,
      });
    }

    const name = await Name.create({
      value: normalizedValue,
      type_id: typeId,
      gender_id: genderId,
      length,
    });

    await name.reload({ include: [{ association: "type" }, { association: "gender" }] });

    return name;
  }

  /**
   * Bulk creates multiple names, skipping duplicates and collecting failures.
   *
   * @param {CreateNameData[]} dataArray - Array of names to create.
   * @returns {Promise<BulkNameResult>} An object containing:
   *   - `created`: Array of successfully created `Name` instances.
   *   - `skipped`: Array of name values that already existed and were skipped.
   *   - `failed`: Array of failed creations with their reason.
   */
  public static async createNames(dataArray: CreateNameData[]): Promise<BulkNameResult> {
    const created: Name[] = [];
    const skipped: string[] = [];
    const failed: { value: string; reason: string }[] = [];

    for (const data of dataArray) {
      try {
        const name = await this.createName(data);
        created.push(name);
      } catch (err) {
        if (err instanceof CustomError && err.statusCode === 409) {
          skipped.push(data.value);
          continue;
        } else {
          failed.push({
            value: data.value,
            reason: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }
    }

    return { created, skipped, failed };
  }

  /**
   * Validates an array of raw name items with Joi (item-by-item), then creates the valid ones.
   * Supports partial success: invalid items are collected with their validation errors.
   *
   * @param {unknown[]} rawArray - The raw input array of names to validate and create.
   * @returns {Promise<BulkNameResult>} An object containing:
   *   - `created`: Array of successfully created `Name` instances.
   *   - `skipped`: Array of name values that already existed and were skipped.
   *   - `failed`: Array of failed creations with their reason.
   * @throws {CustomError} If:
   *   - The payload is not an array (400 Bad Request).
   */
  public static async validateAndCreateNames(rawArray: unknown[]): Promise<BulkNameResult> {
    if (!Array.isArray(rawArray)) {
      throw new CustomError({
        statusCode: 400,
        message: "Invalid payload: expected an array of names.",
      });
    }

    const validItems: CreateNameData[] = [];
    const validationFailed: { value: string; reason: string }[] = [];

    for (let i = 0; i < rawArray.length; i++) {
      const raw = rawArray[i];
      try {
        const v = await createNameSchema.validateAsync(raw, {
          abortEarly: false,
          stripUnknown: true,
        });

        validItems.push(v);
      } catch (err: any) {
        const msgs = Array.isArray(err?.details)
          ? err.details.map((d: any) => d.message).join("; ")
          : err?.message ?? "Validation error";

        validationFailed.push({
          value: typeof (raw as any)?.value === "string" ? (raw as any).value : `(index ${i})`,
          reason: msgs,
        });
      }
    }

    const { created, skipped, failed } = await this.createNames(validItems);

    return { created, skipped, failed: [...validationFailed, ...failed] };
  }

  /**
   * Imports and creates names from a JSON file buffer.
   *
   * @param {Buffer} buffer - The file buffer containing a JSON array of names to import.
   * @returns {Promise<BulkNameResult>} An object containing:
   *   - `created`: Array of successfully created `Name` instances.
   *   - `skipped`: Array of name values that already existed and were skipped.
   *   - `failed`: Array of failed creations with their reason.
   * @throws {CustomError} If:
   *   - The JSON format is invalid (400 Bad Request).
   */
  public static async importFromJsonBuffer(buffer: Buffer): Promise<BulkNameResult> {
    const content = buffer.toString("utf-8");

    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch (err) {
      throw new CustomError({ statusCode: 400, message: "Invalid JSON file format." });
    }

    return this.validateAndCreateNames(parsed as unknown[]);
  }

  /**
   * Generates a random set of active names for a given type.
   *
   * Only names with status `"active"` are eligible.
   *
   * @param {number} typeId - The ID of the type to scope the random draw.
   * @param {number} limit - The maximum number of names to return.
   * @param {GenerateNameFilters} [filters] - Optional filters to apply:
   *   - `genderId` : Filter by associated gender ID.
   *   - `length`: Filter by name length category (`short`, `medium`, `long`).
   *   - `charLength`: Filter by the exact number of characters in the name value.
   * @returns {Promise<Name[]>} An array of randomly selected `Name` instances.
   * @throws {CustomError} If:
   *   - Provided `typeId` or `genderId` do not exist (404 Not Found).
   */
  public static async generateRandomNamesFromType(
    typeId: number,
    limit: number,
    filters?: GenerateNameFilters
  ): Promise<Name[]> {
    await TypeService.findTypeById(typeId);

    let where: FlexibleWhere<Name> = {
      type_id: typeId,
      status: "active",
    };

    if (filters) {
      const { genderId, length, charLength } = filters;

      if (genderId) {
        await GenderService.findGenderById(genderId);
        where.gender_id = genderId;
      }

      if (length) {
        where.length = length;
      }

      if (charLength) {
        where[Op.and] = [...(where[Op.and] ?? []), whereFn(fn("CHAR_LENGTH", col("value")), { [Op.eq]: charLength })];
      }
    }

    const names = await Name.findAll({
      where,
      order: [Sequelize.literal("RAND()")],
      include: [{ association: "type" }, { association: "gender" }],
      limit,
    });

    return names;
  }

  /**
   * Updates an existing name.
   *
   * @param {string} id - The unique ID of the name to update.
   * @param {UpdateNameData} data - The fields to update, such as value, typeId or genderId.
   * @returns {Promise<Name>} The updated name instance.
   * @throws {CustomError} If:
   *   - The name is archived (422 Unprocessable Entity).
   *   - Provided `typeId` or `genderId` do not exist (404 Not Found).
   *   - The name has favorites and `value` is changed (403 Forbidden).
   *   - Another name with the same value and type already exists (409 Conflict).
   */
  public static async updateName(id: string, data: UpdateNameData): Promise<Name> {
    const name = await this.findNameById(id);

    if (name.status === "archived") {
      throw new CustomError({
        statusCode: 422,
        message: "Cannot modify an archived name.",
      });
    }

    if (data.typeId && data.typeId !== name.type_id) {
      await TypeService.findTypeById(data.typeId);
    }

    if (data.genderId && data.genderId !== name.gender_id) {
      await GenderService.findGenderById(data.genderId);
    }

    const normalizedValue = data.value?.trim();
    const valueChanged = normalizedValue && normalizedValue !== name.value;

    if (valueChanged) {
      const favoritesCount = await Favorite.count({ where: { name_id: name.id } });

      if (favoritesCount > 0) {
        throw new CustomError({
          statusCode: 403,
          message: "This name has been favorited and cannot be renamed. Consider duplicating it.",
        });
      }
    }

    const typeChanged = data.typeId && data.typeId !== name.type_id;

    if (valueChanged || typeChanged) {
      const value = normalizedValue ?? name.value;
      const typeId = data.typeId ?? name.type_id;

      const exists = await Name.findOne({
        where: { value, type_id: typeId },
        include: [{ association: "type" }],
      });

      if (exists && exists.id !== name.id) {
        throw new CustomError({
          statusCode: 409,
          message: `The name "${value}" already exists for the ${
            exists.type?.label ? `type ${exists.type?.label}` : "provided type"
          }.`,
        });
      }
    }

    return name.updateFields(data);
  }

  /**
   * Activates a name by setting its status to "active".
   *
   * @param {string} id - The unique ID of the name to activate.
   * @returns {Promise<Name>} The updated name instance with status set to "active".
   * @throws {CustomError} If:
   *    - No name is found with the provided ID.
   */
  public static async activateName(id: string): Promise<Name> {
    const name = await NameService.findNameById(id);
    return name.setStatus("active");
  }

  /**
   * Deactivates a name by setting its status to "inactive".
   *
   * @param {string} id - The unique ID of the name to deactivate.
   * @returns {Promise<Name>} The updated name instance with status set to "inactive".
   * @throws {CustomError} If:
   *    - No name is found with the provided ID.
   */
  public static async deactivateName(id: string): Promise<Name> {
    const name = await NameService.findNameById(id);
    return name.setStatus("inactive");
  }

  /**
   * Archives a name by setting its status to "archived".
   *
   * @param {string} id - The unique ID of the name to archive.
   * @returns {Promise<Name>} The updated name instance with status set to "archived".
   * @throws {CustomError} If:
   *    - No name is found with the provided ID.
   */
  public static async archiveName(id: string): Promise<Name> {
    const name = await NameService.findNameById(id);
    return name.setStatus("archived");
  }
}

export default NameService;
