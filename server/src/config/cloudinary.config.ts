import { v2 as cloudinary } from "cloudinary";

import config from "@/config/app.config.js";

const { name, key, secret } = config.cloudinary;

cloudinary.config({
  cloud_name: name,
  api_key: key,
  api_secret: secret,
});

export default cloudinary;
