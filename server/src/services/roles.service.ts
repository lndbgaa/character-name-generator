import { Role } from "@/models/index.js";
import CustomError from "@/utils/CustomError.utils.js";

import type { FindOptions } from "sequelize";

class RoleService {
  public static async findRoleById(id: number, options?: FindOptions): Promise<Role> {
    const role = await Role.findByPk(id, options);

    if (!role) {
      throw new CustomError({
        statusCode: 404,
        message: "No role found with the provided ID.",
        details: { id },
      });
    }

    return role;
  }
}

export default RoleService;
