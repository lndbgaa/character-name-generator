import { Router } from "express";

import authRoutes from "@/routes/auth.routes.js";
import typesRoutes from "@/routes/types.routes.js";
import universesRoutes from "@/routes/universes.routes.js";
import usersPrivateRoutes from "@/routes/users.private.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users/me", usersPrivateRoutes);
router.use("/universes", universesRoutes);
router.use("/types", typesRoutes);

export default router;
