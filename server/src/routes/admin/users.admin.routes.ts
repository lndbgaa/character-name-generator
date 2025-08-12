import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateAll.js";

import { reactivateUser, suspendUser } from "@/controllers/users/users.controller.js";
import { idUuidParamSchema } from "@/validators/common.schema.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["admin"]));

router.patch("/:id/suspend", validate(idUuidParamSchema, "params"), suspendUser);
router.patch("/:id/reactivate", validate(idUuidParamSchema, "params"), reactivateUser);

export default router;
