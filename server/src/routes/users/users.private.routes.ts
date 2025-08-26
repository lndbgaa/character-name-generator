import { Router } from "express";

import imageUpload from "@/middlewares/image-upload.middleware.js";
import requireAuth from "@/middlewares/require-auth.middleware.js";
import validate from "@/middlewares/validate-all.middleware.js";

import { idUuidParamSchema } from "@/validators/common.schema.js";
import { addFavoriteBodySchema, updateFavoriteBodySchema } from "@/validators/favorite.schema.js";
import { updateProfileBodySchema } from "@/validators/user.schema.js";

import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
  updateFavorite,
} from "@/controllers/users/users.favorites.controller.js";
import {
  getMyInfo,
  updateMyAvatar,
  updateMyProfile,
} from "@/controllers/users/users.profile.controller.js";

const router = Router();

router.use(requireAuth);

// Profile
router.get("/", getMyInfo);
router.patch("/", validate(updateProfileBodySchema), updateMyProfile);
router.patch("/avatar", imageUpload, updateMyAvatar);

// Favorites
router.get("/favorites", getMyFavorites);
router.post("/favorites", validate(addFavoriteBodySchema), addFavorite);
router.patch(
  "/favorites/:id",
  validate(idUuidParamSchema, "params"),
  validate(updateFavoriteBodySchema),
  updateFavorite
);
router.delete("/favorites/:id", validate(idUuidParamSchema, "params"), removeFavorite);

export default router;
