import { Router } from "express";

import requireAuth from "@/middlewares/require-auth.middleware.js";
import requireRole from "@/middlewares/require-role.middleware.js";
import validate from "@/middlewares/validate-all.middleware.js";

import { idUuidParamSchema } from "@/validators/common.schema.js";

import { getUsers, reactivateUser, suspendUser } from "@/controllers/users/users.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["admin"]));

router.get("/", getUsers);
router.patch("/:id/suspend", validate(idUuidParamSchema, "params"), suspendUser);
router.patch("/:id/reactivate", validate(idUuidParamSchema, "params"), reactivateUser);

export default router;
