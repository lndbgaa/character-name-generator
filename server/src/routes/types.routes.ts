import { Router } from "express";

import optionalAuth from "@/middlewares/optional-auth.middleware.js";
import validate from "@/middlewares/validate-all.middleware.js";

import { idIntParamSchema } from "@/validators/common.schema.js";
import { generateRandomNamesByTypeSchema } from "@/validators/name.schema.js";
import { getAllTypesSchema } from "@/validators/type.schema.js";

import { generateRandomNamesByType } from "@/controllers/names.controller.js";
import { getType, getTypes } from "@/controllers/types.controller.js";

const router = Router();

router.get("/", optionalAuth, validate(getAllTypesSchema, "query"), getTypes);

router.get("/:id", optionalAuth, validate(idIntParamSchema, "params"), getType);

router.get(
  "/:id/names/random",
  optionalAuth,
  validate(idIntParamSchema, "params"),
  validate(generateRandomNamesByTypeSchema, "query"),
  generateRandomNamesByType
);

export default router;
