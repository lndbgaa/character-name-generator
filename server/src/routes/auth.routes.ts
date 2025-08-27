import { Router } from "express";

import validate from "@/middlewares/validate-all.middleware.js";

import {
  loginUserBodySchema,
  passwordResetBodySchema,
  registerUserBodySchema,
  requestPasswordResetBodySchema,
  resendVerificationEmailBodySchema,
  verifyEmailBodySchema,
  verifyPasswordResetBodySchema,
} from "@/validators/auth.schema.js";

import {
  loginUser,
  logoutUser,
  refreshUserAccessToken,
  registerUser,
  requestPasswordReset,
  resendVerificationEmail,
  resetUserPassword,
  verifyEmail,
  verifyPasswordResetToken,
} from "@/controllers/auth.controller.js";

const router = Router();

router.post("/register", validate(registerUserBodySchema), registerUser);
router.post("/verify-email/resend", validate(resendVerificationEmailBodySchema), resendVerificationEmail);
router.post("/verify-email/verify", validate(verifyEmailBodySchema), verifyEmail);

router.post("/login", validate(loginUserBodySchema), loginUser);

router.post("/refresh-token", refreshUserAccessToken);

router.post("/logout", logoutUser);

router.post("/reset-password/request", validate(requestPasswordResetBodySchema), requestPasswordReset);
router.post("/reset-password/verify", validate(verifyPasswordResetBodySchema), verifyPasswordResetToken);
router.post("/reset-password", validate(passwordResetBodySchema), resetUserPassword);

export default router;
