import { col, fn, Op, Sequelize } from "sequelize";

import { User } from "@/models/index.js";
import RoleService from "@/services/roles.service.js";
import CustomError from "@/utils/CustomError.utils.js";
import { escapeLike } from "@/utils/string.utils.js";

import type { FlexibleWhere } from "@/types/sequelize.types.js";
import type { GetUsersFilters, GetUserSortOptions } from "@/types/users/user.types.js";
import type { FindOptions } from "sequelize";
class UserService {
  /**
   * Retrieves a user by their unique ID.
   *
   * @param {string} userId - The unique ID of the user to retrieve.
   * @param {FindOptions} [options] - Additional Sequelize find options (e.g., includes).
   * @returns {Promise<User>} The found user instance.
   * @throws {CustomError} If no user is found with the provided ID.
   */
  public static async findUserById(userId: string, options?: FindOptions): Promise<User> {
    const user = await User.findOne({
      where: { id: userId },
      ...options,
    });

    if (!user) {
      throw new CustomError({
        statusCode: 404,
        message: "No user found with the provided id.",
        details: { userId },
      });
    }

    return user;
  }

  /**
   *
   * @param {number} limit
   * @param {number} offset
   * @param {GetUsersFilters} filters
   * @returns {Promise<{ count: number; users: User[] }>}
   * @throws {CustomError} If:
   */

  public static async findAllUsers(
    limit: number,
    offset: number,
    filters?: GetUsersFilters,
    orderOpts: GetUserSortOptions = { sort: "created_at", dir: "DESC" }
  ): Promise<{ count: number; users: User[] }> {
    let where: FlexibleWhere<User> = {};

    if (filters) {
      const { roleId, status } = filters;
      let { search } = filters;

      if (roleId) {
        await RoleService.findRoleById(roleId);
        where.role_id = roleId;
      }

      if (status) {
        where.status = status;
      }

      if (search && search.length > 0) {
        search = search.trim();

        if (search.length > 100) search = search.slice(0, 100);

        const safe = escapeLike(search);
        const term = `%${safe}%`;

        where[Op.or] = [
          ...(where[Op.or] ?? []),
          { email: { [Op.like]: term } },
          { username: { [Op.like]: term } },
          { first_name: { [Op.like]: term } },
          { last_name: { [Op.like]: term } },
          Sequelize.where(fn("CONCAT_WS", col("first_name"), " ", col("last_name")), { [Op.like]: term }),
        ];
      }
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ association: "role" }],
      limit,
      offset,
      order: [
        [orderOpts.sort, orderOpts.dir],
        ["created_at", "DESC"],
        ["id", "ASC"],
      ],
      distinct: true,
      attributes: { exclude: ["password"] },
    });

    return { count, users: rows };
  }

  /**
   * Suspends a user account by setting its status to "suspended".
   * If the account is already suspended, no changes are made.
   *
   * @param {string} id - The unique ID of the user to suspend.
   * @returns {Promise<User>} - The updated user instance.
   * @throws {CustomError} If no user is found with the provided ID.
   */
  public static async suspendUser(id: string): Promise<User> {
    const user = await this.findUserById(id);
    return user.suspend();
  }

  /**
   * Reactivates a previously suspended user account by setting its status to "active".
   * If the account is already active, no changes are made.
   *
   * @param {string} id - The unique ID of the user to reactivate.
   * @returns {Promise<User>} The updated user instance.
   * @throws {CustomError} If no user is found with the provided ID.
   */
  public static async reactivateUser(id: string): Promise<User> {
    const user = await this.findUserById(id);
    return user.reactivate();
  }
}

export default UserService;
