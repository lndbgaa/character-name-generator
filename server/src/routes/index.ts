import { Router } from "express";

import authRoutes from "@/routes/auth.route.js";
import userPrivateRoutes from "@/routes/user.private.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users/me", userPrivateRoutes);

export default router;
