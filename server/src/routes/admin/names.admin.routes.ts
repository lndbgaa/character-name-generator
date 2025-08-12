import { Router } from "express";

import jsonUpload from "@/middlewares/jsonUpload.js";
import requireAuth from "@/middlewares/requireAuth.js";
import requireRole from "@/middlewares/requireRole.js";
import validate from "@/middlewares/validateAll.js";

import { idUuidParamSchema } from "@/validators/common.schema.js";
import { createNameSchema, getNamesSchema, updateNameSchema } from "@/validators/name.schema.js";

import {
  activateName,
  archiveName,
  bulkCreateNames,
  createName,
  deactivateName,
  getNames,
  importNamesFromFile,
  updateName,
} from "@/controllers/names.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["admin"]));

// Read
router.get("/", validate(getNamesSchema, "query"), getNames);

// Create
router.post("/", validate(createNameSchema), createName);
router.post("/bulk", bulkCreateNames);
router.post("/import", jsonUpload, importNamesFromFile);

// Update
router.patch("/:id", validate(idUuidParamSchema, "params"), validate(updateNameSchema), updateName);
router.patch("/:id/activate", validate(idUuidParamSchema, "params"), activateName);
router.patch("/:id/deactivate", validate(idUuidParamSchema, "params"), deactivateName);
router.patch("/:id/archive", validate(idUuidParamSchema, "params"), archiveName);

export default router;
