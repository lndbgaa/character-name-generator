import { col, fn, Op, Sequelize } from "sequelize";

import {
  ACCOUNT_ROLES_LABEL,
  ACCOUNT_ROLES_MAP_REVERSE,
  ACCOUNT_STATUSES,
} from "@/constants/user.constants.js";

import { User } from "@/models/index.js";
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
   * Retrieves a paginated list of users with optional filters and sorting.
   *
   * @param {number} limit
   * @param {number} offset
   * @param {GetUserSortOptions} [orderOpts] - Sorting options.
   * @param {GetUsersFilters} [filters] - Optional filters to apply.
   * @returns {Promise<{ count: number; users: User[] }>} - An object containing:
   *   - `count` → total number of matching users.
   *   - `users` → array of `User` entities for the current page.
   * @throws {CustomError} If:
   *   - An invalid `role` is provided.
   *   - An invalid `status` is provided.
   */
  public static async findUsers(
    limit: number,
    offset: number,
    orderOpts?: GetUserSortOptions,
    filters?: GetUsersFilters
  ): Promise<{ count: number; users: User[] }> {
    let where: FlexibleWhere<User> = {};

    if (filters) {
      const { role, status } = filters;
      let { search } = filters;

      if (role) {
        const roleId = ACCOUNT_ROLES_MAP_REVERSE[role];

        if (!roleId) {
          throw new CustomError({
            statusCode: 400,
            message: "Invalid role value.",
            debugMessage: `Invalid role "${role}". Allowed values are: ${Object.values(
              ACCOUNT_ROLES_LABEL
            ).join(", ")}.`,
          });
        }

        where.role_id = roleId;
      }

      if (status) {
        if (!Object.values(ACCOUNT_STATUSES).includes(status)) {
          throw new CustomError({
            statusCode: 400,
            message: "Invalid status value.",
            debugMessage: `Invalid status "${status}". Allowed values are: ${Object.values(
              ACCOUNT_STATUSES
            ).join(", ")}.`,
          });
        }

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
          Sequelize.where(fn("CONCAT_WS", col("first_name"), " ", col("last_name")), {
            [Op.like]: term,
          }),
        ];
      }
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ association: "role" }],
      limit,
      offset,
      order: [
        [orderOpts?.sort ?? "created_at", orderOpts?.dir ?? "DESC"],
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
