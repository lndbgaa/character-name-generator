import { User } from "@/models/index.js";
import AuthService from "@/services/auth/auth.service.js";
import UploadService from "@/services/upload.service.js";
import UserService from "@/services/users/users.service.js";

import type { UpdateUserData } from "@/types/users/users.types";

class ProfileService {
  /**
   * Updates the profile details of a user.
   *
   * @param {string} userId - The unique ID of the user to update.
   * @param {UpdateUserData} data - The new profile data to apply to the user.
   * @returns {Promise<User>} The updated user instance.
   * @throws {CustomError} If the user is not found or if the username is changed and already taken.
   */
  public static async updateProfile(userId: string, data: UpdateUserData): Promise<User> {
    const user = await UserService.findUserById(userId, { include: [{ association: "role" }] });

    if (data.username && data.username !== user.username) {
      await AuthService.assertUsernameIsUnique(data.username);
    }

    return user.updateProfile(data);
  }

  /**
   * Updates a user's avatar image.
   *
   * @param {string} userId - The unique ID of the user whose avatar is being updated.
   * @param {Express.Multer.File} file - The uploaded image file to set as the avatar.
   * @returns {Promise<{ url: string }>} The URL of the newly uploaded avatar image.
   * @throws {CustomError} If the user is not found.
   */
  public static async updateAvatar(userId: string, file: Express.Multer.File): Promise<{ url: string }> {
    const user = await UserService.findUserById(userId);

    const { secure_url: url } = await UploadService.uploadImage(file, `charnamegen/users/${userId}/profile-picture`);

    await user.updateAvatar(url);

    return { url };
  }
}

export default ProfileService;
