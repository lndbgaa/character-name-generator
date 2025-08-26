import CustomError from "@/utils/CustomError.utils.js";
import { normalizeLabel } from "@/utils/string.utils.js";

import type { GenderId, GenderLabel } from "@/types/gender.types.js";
import { Gender } from "../models";

class GenderService {
  /**
   * Retrieves a gender by its label.
   *
   * @param {GenderLabel} label - Gender label.
   * @returns {GenderId} The found `Gender`instance.
   * @throws {CustomError} If no gender is found with the provided label (404 Not Found).
   */
  public static async findGenderByLabel(label: GenderLabel): Promise<Gender> {
    const normalized = normalizeLabel(label);

    const gender = await Gender.findOne({ where: { label: normalized } });

    if (!gender) {
      throw new CustomError({
        statusCode: 404,
        message: "No gender found with the provided label.",
        details: { provided: label, normalized },
      });
    }

    return gender;
  }
}

export default GenderService;
