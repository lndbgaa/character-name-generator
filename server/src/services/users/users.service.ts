import { User } from "@/models/index.js";
import CustomError from "@/utils/CustomError.js";

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
