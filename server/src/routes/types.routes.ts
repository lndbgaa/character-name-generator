import { Router } from "express";

import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateAll.js";

import { idIntParamSchema } from "@/validators/common.schema.js";
import { createTypeSchema, getAllTypesSchema, updateTypeSchema } from "@/validators/type.schema.js";

import { createType, deleteType, getAllTypes, getType, updateType } from "@/controllers/types.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["admin"]));

router.get("/", validate(getAllTypesSchema, "query"), getAllTypes);
router.get("/:id", validate(idIntParamSchema, "params"), getType);
router.post("/", validate(createTypeSchema), createType);
router.patch("/:id", validate(idIntParamSchema, "params"), validate(updateTypeSchema), updateType);
router.delete("/:id", validate(idIntParamSchema, "params"), deleteType);

export default router;
