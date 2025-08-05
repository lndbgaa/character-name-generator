import { Router } from "express";

import multerUploads from "@/middlewares/multerUploads.js";
import requireAuth from "@/middlewares/requireAuth.js";
import validate from "@/middlewares/validateAll.js";

import { idParamSchema } from "@/validators/common.validator.js";
import { addFavoriteSchema, updateFavoriteSchema } from "@/validators/favorite.validator.js";
import { updateProfileSchema } from "@/validators/user.validator.js";

import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
  updateFavorite,
} from "@/controllers/user/favorites.controller.js";
import { getMyInfo, updateMyAvatar, updateMyProfile } from "@/controllers/user/profile.controller.js";

const router = Router();

router.use(requireAuth);

// Profile
router.get("/", getMyInfo);
router.patch("/", validate(updateProfileSchema), updateMyProfile);
router.patch("/avatar", multerUploads, updateMyAvatar);

// Favorites
router.get("/favorites", getMyFavorites);
router.post("/favorites", validate(addFavoriteSchema), addFavorite);
router.patch("/favorites/:id", validate(idParamSchema, "params"), validate(updateFavoriteSchema), updateFavorite);
router.delete("/favorites/:id", validate(idParamSchema, "params"), removeFavorite);

export default router;
