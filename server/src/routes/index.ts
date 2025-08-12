import { Router } from "express";

import namesAdminRoutes from "@/routes/admin/names.admin.routes.js";
import typesAdminRoutes from "@/routes/admin/types.admin.routes.js";
import universesAdminRoutes from "@/routes/admin/universes.admin.routes.js";
import usersAdminRoutes from "@/routes/admin/users.admin.routes.js";
import authRoutes from "@/routes/auth.routes.js";
import namesRoutes from "@/routes/names.routes.js";
import typesRoutes from "@/routes/types.routes.js";
import universesRoutes from "@/routes/universes.routes.js";
import usersPrivateRoutes from "@/routes/users/users.private.routes.js";

const router = Router();

// Auth
router.use("/auth", authRoutes);

// Public resources
router.use("/names", namesRoutes);
router.use("/types", typesRoutes);
router.use("/universes", universesRoutes);

// User-specific
router.use("/users/me", usersPrivateRoutes);

// Admin
router.use("/admin/users", usersAdminRoutes);
router.use("/admin/universes", universesAdminRoutes);
router.use("/admin/types", typesAdminRoutes);
router.use("/admin/names", namesAdminRoutes);

export default router;
