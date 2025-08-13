import { Gender } from "@/models/index.js";
import CustomError from "@/utils/CustomError.utils.js";

import type { FindOptions } from "sequelize";

class GenderService {
  public static async findGenderById(id: number, options?: FindOptions): Promise<Gender> {
    const gender = await Gender.findByPk(id, options);

    if (!gender) {
      throw new CustomError({
        statusCode: 404,
        message: "No gender found with the provided ID.",
        details: { id },
      });
    }

    return gender;
  }
}

export default GenderService;
