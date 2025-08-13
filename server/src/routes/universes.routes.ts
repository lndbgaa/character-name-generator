import { Router } from "express";

import optionalAuth from "@/middlewares/optional-auth.middleware.js";
import validate from "@/middlewares/validate-all.middleware.js";
import { idIntParamSchema } from "@/validators/common.schema.js";

import { getUniverse, getUniverses } from "@/controllers/universes.controller.js";

const router = Router();

router.get("/", optionalAuth, getUniverses);
router.get("/:id", optionalAuth, validate(idIntParamSchema, "params"), getUniverse);

export default router;
