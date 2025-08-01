import { Router } from "express";

import validate from "@/middlewares/validateAll.js";

import {
  loginSchema,
  passwordResetSchema,
  registerSchema,
  requestPasswordResetSchema,
  verifyPasswordResetSchema,
} from "@/validators/auth.validator.js";

import {
  loginUser,
  logoutUser,
  refreshUserAccessToken,
  registerUser,
  requestPasswordReset,
  resetUserPassword,
  verifyPasswordResetToken,
} from "@/controllers/auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshUserAccessToken);

router.post("/reset-password/request", validate(requestPasswordResetSchema), requestPasswordReset);
router.post("/reset-password/verify", validate(verifyPasswordResetSchema), verifyPasswordResetToken);
router.post("/reset-password", validate(passwordResetSchema), resetUserPassword);

export default router;
