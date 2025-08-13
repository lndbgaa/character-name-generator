import { Router } from "express";

import optionalAuth from "@/middlewares/optional-auth.middleware.js";
import validate from "@/middlewares/validate-all.middleware.js";

import { idUuidParamSchema } from "@/validators/common.schema.js";

import { getName } from "@/controllers/names.controller.js";

const router = Router();

router.get("/:id", optionalAuth, validate(idUuidParamSchema, "params"), getName);

export default router;
