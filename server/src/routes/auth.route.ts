import { Router } from "express";

import {
  loginUser,
  logoutUser,
  refreshUserAccessToken,
  registerUser,
} from "@/controllers/auth.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshUserAccessToken);

export default router;
