import { Router } from "express";

import requireAuth from "@/middlewares/require-auth.middleware.js";
import requireRole from "@/middlewares/require-role.middleware.js";

import validate from "@/middlewares/validate-all.middleware.js";
import { idIntParamSchema } from "@/validators/common.schema.js";
import { createUniverseSchema, updateUniverseSchema } from "@/validators/universe.schema.js";

import {
  activateUniverse,
  archiveUniverse,
  createUniverse,
  deactivateUniverse,
  updateUniverse,
} from "@/controllers/universes.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["admin"]));

// Create
router.post("/", validate(createUniverseSchema), createUniverse);

// Update
router.patch("/:id", validate(idIntParamSchema, "params"), validate(updateUniverseSchema), updateUniverse);
router.patch("/:id/activate", validate(idIntParamSchema, "params"), activateUniverse);
router.patch("/:id/deactivate", validate(idIntParamSchema, "params"), deactivateUniverse);
router.patch("/:id/archive", validate(idIntParamSchema, "params"), archiveUniverse);

export default router;
