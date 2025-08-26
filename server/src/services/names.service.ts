import { col, fn, Op, Sequelize, where as whereFn } from "sequelize";

import { DEFAULT_RANDOM_NAMES, NAME_LENGTHS, NAME_STATUSES } from "@/constants/name.constants.js";

import { Favorite, Name } from "@/models/index.js";
import GenderService from "@/services/genders.service.js";
import TypeService from "@/services/types.service.js";
import CustomError from "@/utils/CustomError.utils.js";
import { capitalize, escapeLike } from "@/utils/string.utils.js";
import { createNameBodySchema } from "@/validators/name.schema.js";

import type {
  BulkNameResult,
  CreateNamePayload,
  GenerateNamesFilters,
  GetNamesFilters,
  GetNamesSortOptions,
  NameLength,
  UpdateNamePayload,
} from "@/types/names.types.js";
import type { FlexibleWhere } from "@/types/sequelize.types.js";
import type { FindOptions, WhereOptions } from "sequelize";

class NameService {
  private static readonly defaultIncludes = [{ association: "type" }, { association: "gender" }];

  /**
   * Retrieves a name by its unique ID.
   *
   * @param {string} id - The unique ID of the name to retrieve.
   * @param {FindOptions<Name>} [options] - Additional Sequelize find options (e.g., includes).
   * @returns {Promise<Name>} The found `Name` instance.
   * @throws {CustomError} If no name is found with the provided ID (404 Not Found).
   */
  public static async findNameById(id: string, options?: FindOptions<Name>): Promise<Name> {
    const where: WhereOptions = { ...(options?.where ?? {}), id };

    const include = [
      ...this.defaultIncludes,
      ...(Array.isArray(options?.include) ? options.include : options?.include ? [options.include] : []),
    ];

    const name = await Name.findOne({
      ...options,
      where,
      include,
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
   *  Retrieves a paginated list of names with optional filters and sorting.
   *
   * @param {number} limit
   * @param {number} offset
   * @param {GetNamesSortOptions} [orderOpts] - Sorting options:
   *   - `sort` → Field to sort by (default: "created_at").
   *   - `dir` → Direction ("ASC" | "DESC", default: "DESC").
   * @param {GetNamesFilters} [filters] - Optional filters:
   *   - `search` → Case-insensitive substring search on value.
   *   - `typeLabel` → Filter by type (vampire, elf, dragon..).
   *   - `genderLabel` → Filter by gender (male, female, neutral).
   *   - `length` → Filter by name length category (short, long, medium).
   *   - `charLength` → Filter by exact character count.
   *   - `status` → Filter by status (active, inactive, archived).
   * @param {FindOptions<Name>} [options] - Additional Sequelize find options (e.g., includes).
   * @returns {Promise<{ count: number; names: Name[] }>} An object containing:
   *   - `count` → Total number of matching names.
   *   - `names` → Array of `Name` entities for the current page.
   * @throws {CustomError} If provided `typeLabel` or `genderLabel` filter do not exist (404 Not Found).
   */
  public static async findNames(
    limit: number,
    offset: number,
    orderOpts?: GetNamesSortOptions,
    filters?: GetNamesFilters,
    options?: FindOptions<Name>
  ): Promise<{ count: number; names: Name[] }> {
    let where: FlexibleWhere<Name> = { ...(options?.where ?? {}) };

    // FIXME improve typing

    if (filters) {
      const { search, typeLabel, genderLabel, length, charLength, status } = filters;

      if (typeLabel) {
        const typeRecord = await TypeService.findTypeByLabel(typeLabel);
        (where as any).type_id = typeRecord.id;
      }

      if (genderLabel) {
        const gender = await GenderService.findGenderByLabel(genderLabel);
        (where as any).gender_id = gender.id;
      }

      if (length) {
        (where as any).length = length;
      }

      if (status) {
        (where as any).status = status;
      }

      if (charLength) {
        where[Op.and] = [...(where[Op.and] ?? []), whereFn(fn("CHAR_LENGTH", col("value")), { [Op.eq]: charLength })];
      }

      if (search && search.length > 0) {
        let trimmed = search.trim();

        if (trimmed.length > 100) trimmed = trimmed.slice(0, 100);

        const safe = escapeLike(trimmed);
        const term = `${safe}%`;

        where[Op.and] = [...(where[Op.and] ?? []), Sequelize.where(fn("LOWER", col("value")), { [Op.like]: term })];
      }
    }

    const include = [
      ...this.defaultIncludes,
      ...(Array.isArray(options?.include) ? options.include : options?.include ? [options.include] : []),
    ];

    const sortField = orderOpts?.sort ?? "created_at";
    const sortDir = orderOpts?.dir ?? "DESC";

    const { count, rows } = await Name.findAndCountAll({
      ...options,
      where,
      include,
      limit,
      offset,
      order: [
        [sortField, sortDir],
        ["id", "ASC"],
      ],
      distinct: true,
    });

    return { count, names: rows };
  }

  /**
   * Creates a new name.
   *
   * @param {CreateNameData} data - The data required to create the name.
   * @returns {Promise<Name>} The newly created `Name` instance.
   * @throws {CustomError} If:
   *   - The provided `typeLabel` does not exist (404 Not Found).
   *   - The provided `genderLabel` does not exist (404 Not Found).
   *   - The provided `genderLabel` is not allowed for the given `type` (400 Bad Request).
   *   - A name with the same value already exists for the given type (409 Conflict).
   */
  public static async createName(data: CreateNamePayload): Promise<Name> {
    const { value, typeLabel, genderLabel } = data;

    const type = await TypeService.findTypeByLabel(typeLabel);
    const gender = await GenderService.findGenderByLabel(genderLabel);

    TypeService.assertTypeGenderIsAllowed(type, gender.label);

    const normalizedValue = capitalize(value);

    const exists = await Name.findOne({
      where: { value: normalizedValue, type_id: type.id },
      include: [{ association: "type" }],
    });

    if (exists) {
      throw new CustomError({
        statusCode: 409,
        message: `The name "${normalizedValue}" already exists for the ${
          exists.type?.label ? `type ${exists.type?.label}` : "provided type"
        }.`,
        details: { provided: value, normalized: normalizedValue },
      });
    }

    const length = computeNameLength(normalizedValue);

    const name = await Name.create({
      value: normalizedValue,
      type_id: type.id,
      gender_id: gender.id,
      length,
    });

    return name.reload({ include: this.defaultIncludes });
  }

  /**
   * Bulk creates multiple names, skipping duplicates and collecting failures.
   *
   * @param {CreateNameData[]} dataArray - Array of names to create.
   * @returns {Promise<BulkNameResult>} An object containing:
   *   - `created`→ Array of successfully created `Name` instances.
   *   - `skipped`→ Array of name values that already existed and were skipped.
   *   - `failed`→ Array of failed creations with their reason.
   */
  public static async createNames(dataArray: CreateNamePayload[]): Promise<BulkNameResult> {
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
   *   - `created` → Array of successfully created `Name` instances.
   *   - `skipped` → Array of name values that already existed and were skipped.
   *   - `failed` → Array of failed creations with their reason.
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

    const validItems: CreateNamePayload[] = [];
    const validationFailed: { value: string; reason: string }[] = [];

    for (let i = 0; i < rawArray.length; i++) {
      const raw = rawArray[i];

      try {
        const v = await createNameBodySchema.validateAsync(raw, {
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
   *   - `created` → Array of successfully created `Name` instances.
   *   - `skipped` → Array of name values that already existed and were skipped.
   *   - `failed` → Array of failed creations with their reason.
   * @throws {CustomError} If:
   *   - The JSON format is invalid (400 Bad Request).
   */
  public static async importFromJsonBuffer(buffer: Buffer): Promise<BulkNameResult> {
    const content = buffer.toString("utf-8");

    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch (err) {
      throw new CustomError({
        statusCode: 400,
        message: "Invalid JSON file format.",
      });
    }

    return this.validateAndCreateNames(parsed as unknown[]);
  }

  /**
   * Generates a random set of active names for a given type.
   *
   * Only names with status `"active"` are eligible.
   *
   * @param {number} typeId - The ID of the type to scope the random draw.
   * @param {number} [size] - The maximum number of names to return (default 10).
   * @param {GenerateNameFilters} [filters] - Optional filters to apply:
   *   - `genderLabel` →  Filter by associated gender label (`male`, `female`, `neutral`).
   *   - `length` → Filter by name length category (`short`, `medium`, `long`).
   *   - `charLength` → Filter by the exact number of characters in the name value.
   * @param {FindOptions<Name>} [options] - Additional Sequelize find options (e.g., includes).
   * @returns {Promise<Name[]>} An array of randomly selected `Name` instances.
   * @throws {CustomError} If:
   *   - No `Type` is found with the provided `typeId` (`404 Not Found`).
   *   - The provided type does not support gender filtering but `genderLabel` was given (`400 Bad Request`).
   *   - The provided `genderLabel` does not match any existing gender (`404 Not Found`).
   */
  public static async generateRandomNamesFromType(
    typeId: number,
    size?: number,
    filters?: GenerateNamesFilters,
    options?: FindOptions<Name>
  ): Promise<Name[]> {
    const type = await TypeService.findTypeById(typeId);

    let where: FlexibleWhere<Name> = {
      ...options?.where,
      type_id: type.id,
      status: NAME_STATUSES.ACTIVE,
    };

    if (filters) {
      const { genderLabel, length, charLength } = filters;

      if (genderLabel) {
        const allowed = await type.canBeFilteredByGender();

        if (!allowed) {
          throw new CustomError({
            statusCode: 400,
            message: `The provided type does not support gender filtering.`,
            details: { typeLabel: type.label },
          });
        }

        const gender = await GenderService.findGenderByLabel(genderLabel);

        where.gender_id = gender.id;
      }

      if (length) {
        where.length = length;
      }

      if (charLength) {
        where[Op.and] = [...(where[Op.and] ?? []), whereFn(fn("CHAR_LENGTH", col("value")), { [Op.eq]: charLength })];
      }
    }

    const include = [
      ...this.defaultIncludes,
      ...(Array.isArray(options?.include) ? options.include : options?.include ? [options.include] : []),
    ];

    const names = await Name.findAll({
      ...options,
      where,
      include,
      limit: size ?? DEFAULT_RANDOM_NAMES,
      order: [Sequelize.literal("RAND()")],
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
   *   - The name is archived (409 Conflict).
   *   - Provided `typeId` or `genderId` do not exist (404 Not Found).
   *   - The name has favorites and `value` is changed (403 Forbidden).
   *   - Another name with the same value and type already exists (409 Conflict).
   */
  public static async updateName(id: string, data: UpdateNamePayload): Promise<Name> {
    const { value, typeLabel, genderLabel } = data;

    const name = await this.findNameById(id);

    if (name.status === NAME_STATUSES.ARCHIVED) {
      throw new CustomError({
        statusCode: 409,
        message: "Cannot modify an archived name.",
      });
    }

    const typeChanged = typeLabel && typeLabel !== name.type?.label;
    const genderChanged = genderLabel && genderLabel !== name.gender?.label;

    const newType = typeChanged ? await TypeService.findTypeByLabel(typeLabel) : null;
    const newGender = genderChanged ? await GenderService.findGenderByLabel(genderLabel) : null;

    const finalType = newType ?? name.type!;
    const finalGender = newGender ?? name.gender!;

    if (typeChanged || genderChanged) {
      TypeService.assertTypeGenderIsAllowed(finalType, finalGender.label);
    }

    const normalizedValue = value ? capitalize(value) : undefined;
    const valueChanged = normalizedValue && normalizedValue !== name.value;

    if (valueChanged) {
      const favoriteExists = await Favorite.findOne({ where: { name_id: name.id } });

      if (favoriteExists) {
        throw new CustomError({
          statusCode: 403,
          message: "This name has been favorited and cannot be renamed. Consider duplicating it.",
        });
      }
    }

    if (valueChanged || typeChanged) {
      const finalValue = normalizedValue ?? name.value;

      const exists = await Name.findOne({
        where: { value: finalValue, type_id: finalType.id },
        include: [{ association: "type" }],
      });

      if (exists && exists.id !== name.id) {
        throw new CustomError({
          statusCode: 409,
          message: `The name "${finalValue}" already exists for the ${
            exists.type?.label ? `type ${exists.type?.label}` : "provided type"
          }.`,
        });
      }
    }

    await name.updateFields({
      ...data,
      value: normalizedValue ?? data.value,
      typeId: finalType.id,
      genderId: finalGender.id,
    });

    return name.reload({ include: this.defaultIncludes });
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
    await name.setStatus(NAME_STATUSES.ACTIVE);
    return name.reload({ include: this.defaultIncludes });
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
    await name.setStatus(NAME_STATUSES.INACTIVE);
    return name.reload({ include: this.defaultIncludes });
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
    await name.setStatus(NAME_STATUSES.ARCHIVED);
    return name.reload({ include: this.defaultIncludes });
  }
}

function computeNameLength(val: string): NameLength {
  return val.length >= 9 ? NAME_LENGTHS.LONG : val.length >= 6 ? NAME_LENGTHS.MEDIUM : NAME_LENGTHS.SHORT;
}

export default NameService;
