import { Router } from "express";

import authRoutes from "@/routes/auth.route.js";
import namesRoutes from "@/routes/names.route.js";
import universesRoutes from "@/routes/universes.route.js";
import usersPrivateRoutes from "@/routes/users.private.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users/me", usersPrivateRoutes);
router.use("/universes", universesRoutes);
router.use("/names", namesRoutes);

export default router;
