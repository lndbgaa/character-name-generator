import { Router } from "express";

import validate from "@/middlewares/validateAll.js";

import { loginSchema, registerSchema } from "@/validators/auth.validator.js";

import {
  loginUser,
  logoutUser,
  refreshUserAccessToken,
  registerUser,
} from "@/controllers/auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshUserAccessToken);

export default router;
