import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";

import validate from "@/middlewares/validateAll.js";
import { idIntParamSchema } from "@/validators/common.schema.js";
import { createUniverseSchema, updateUniverseSchema } from "@/validators/universe.schema.js";

import {
  createUniverse,
  deleteUniverse,
  getUniverse,
  getUniverses,
  updateUniverse,
} from "@/controllers/universe.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["admin"]));

router.get("/", getUniverses);
router.get("/:id", validate(idIntParamSchema, "params"), getUniverse);
router.post("/", validate(createUniverseSchema), createUniverse);
router.patch("/:id", validate(idIntParamSchema, "params"), validate(updateUniverseSchema), updateUniverse);
router.delete("/:id", validate(idIntParamSchema, "params"), deleteUniverse);

export default router;
