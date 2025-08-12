import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateAll.js";

import { idIntParamSchema } from "@/validators/common.schema.js";
import { createTypeSchema, updateTypeSchema } from "@/validators/type.schema.js";

import {
  activateType,
  archiveType,
  createType,
  deactivateType,
  updateType,
} from "@/controllers/types.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["admin"]));

// Create
router.post("/", validate(createTypeSchema), createType);

// Update
router.patch("/:id", validate(idIntParamSchema, "params"), validate(updateTypeSchema), updateType);
router.patch("/:id/activate", validate(idIntParamSchema, "params"), activateType);
router.patch("/:id/deactivate", validate(idIntParamSchema, "params"), deactivateType);
router.patch("/:id/archive", validate(idIntParamSchema, "params"), archiveType);

export default router;
