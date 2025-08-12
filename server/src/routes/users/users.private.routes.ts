import { Router } from "express";

import imageUpload from "@/middlewares/imageUpload.js";
import requireAuth from "@/middlewares/requireAuth.js";
import validate from "@/middlewares/validateAll.js";

import { idUuidParamSchema } from "@/validators/common.schema.js";
import { addFavoriteSchema, updateFavoriteSchema } from "@/validators/favorite.schema.js";
import { updateProfileSchema } from "@/validators/user.schema.js";

import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
  updateFavorite,
} from "@/controllers/users/users.favorites.controller.js";
import { getMyInfo, updateMyAvatar, updateMyProfile } from "@/controllers/users/users.profile.controller.js";

const router = Router();

router.use(requireAuth);

// Profile
router.get("/", getMyInfo);
router.patch("/", validate(updateProfileSchema), updateMyProfile);
router.patch("/avatar", imageUpload, updateMyAvatar);

// Favorites
router.get("/favorites", getMyFavorites);
router.post("/favorites", validate(addFavoriteSchema), addFavorite);
router.patch("/favorites/:id", validate(idUuidParamSchema, "params"), validate(updateFavoriteSchema), updateFavorite);
router.delete("/favorites/:id", validate(idUuidParamSchema, "params"), removeFavorite);

export default router;
