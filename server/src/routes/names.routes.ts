import { Router } from "express";

import optionalAuth from "@/middlewares/optionalAuth.js";
import validate from "@/middlewares/validateAll.js";

import { idUuidParamSchema } from "@/validators/common.schema.js";

import { getName } from "@/controllers/names.controller.js";

const router = Router();

router.get("/:id", optionalAuth, validate(idUuidParamSchema, "params"), getName);

export default router;
