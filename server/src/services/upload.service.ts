import cloudinary from "@/config/cloudinary.config.js";
import CustomError from "@/utils/CustomError.js";
import dataUriFromFile from "@/utils/dataUriFromFile.js";

import type { UploadApiResponse } from "cloudinary";

class UploadService {
  private static readonly allowedImageMimedTypes = ["image/jpeg", "image/png", "image/webp"];
  private static readonly maxImageSize = 5 * 1024 * 1024;

  public static async uploadImage(file: Express.Multer.File, path: string): Promise<UploadApiResponse> {
    if (!this.allowedImageMimedTypes.includes(file.mimetype)) {
      throw new CustomError({
        statusCode: 400,
        message: "Unsupported image format. Only JPG and PNG are allowed.",
      });
    }

    if (file.size > this.maxImageSize) {
      throw new CustomError({
        statusCode: 400,
        message: "Image is too large. Maximum allowed size is 5 MB.",
      });
    }

    const file64 = dataUriFromFile(file);

    try {
      return await cloudinary.uploader.upload(file64.content!, {
        public_id: path,
        folder: path,
        overwrite: true,
        resource_type: "image",
      });
    } catch (err) {
      // ??? log

      throw new CustomError({
        statusCode: 500,
        message: "Failed to upload the image. Please try again later.",
      });
    }
  }
}

export default UploadService;
