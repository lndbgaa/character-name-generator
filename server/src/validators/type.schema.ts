import Joi from "joi";

import { DESCRIPTION_MAX, DISPLAY_NAME_MAX, ICON_URL_MAX, LABEL_MAX } from "@/models/Type.model.js";
import { labelRegex } from "@/validators/patterns.js";
import { universeIdSchema } from "@/validators/universe.schema.js";

export const typeIdSchema = Joi.number().integer().positive().required().messages({
  "any.required": "The type ID is required.",
  "number.base": "The type ID must be a number.",
  "number.integer": "The type ID must be an integer.",
  "number.positive": "The type ID must be a positive number.",
});

export const createTypeSchema = Joi.object({
  universeId: universeIdSchema,
  label: Joi.string()
    .trim()
    .max(LABEL_MAX)
    .pattern(labelRegex)
    .required()
    .messages({
      "any.required": "The label is required.",
      "string.base": "The label must be a string.",
      "string.empty": "The label cannot be empty.",
      "string.max": `The label must not exceed ${LABEL_MAX} characters.`,
      "string.pattern.base": "The label can only contain letters, numbers and underscores.",
    }),
  displayName: Joi.string()
    .trim()
    .max(DISPLAY_NAME_MAX)
    .required()
    .messages({
      "any.required": "The display name is required.",
      "string.base": "The display name must be a string.",
      "string.empty": "The display name cannot be empty.",
      "string.max": `The display name must not exceed ${DISPLAY_NAME_MAX} characters.`,
    }),
  description: Joi.string()
    .trim()
    .max(DESCRIPTION_MAX)
    .optional()
    .messages({
      "string.base": "The description must be a string.",
      "string.empty": "The description cannot be empty if provided.",
      "string.max": `The description must not exceed ${DESCRIPTION_MAX} characters.`,
    }),
  iconUrl: Joi.string()
    .trim()
    .max(ICON_URL_MAX)
    .optional()
    .messages({
      "string.base": "The icon URL must be a string.",
      "string.empty": "The icon URL cannot be empty if provided.",
      "string.max": `The icon URL must not exceed ${ICON_URL_MAX} characters.`,
    }),
});

export const updateTypeSchema = Joi.object({
  universeId: universeIdSchema.optional(),
  displayName: Joi.string()
    .trim()
    .max(DISPLAY_NAME_MAX)
    .optional()
    .messages({
      "string.base": "The display name must be a string.",
      "string.empty": "The display name must be a non-empty string.",
      "string.max": `The display name must not exceed ${DISPLAY_NAME_MAX} characters.`,
    }),
  description: Joi.string()
    .trim()
    .max(DESCRIPTION_MAX)
    .allow("")
    .optional()
    .messages({
      "string.base": "The description must be a string.",
      "string.max": `The description must not exceed ${DESCRIPTION_MAX} characters.`,
    }),
  iconUrl: Joi.string()
    .trim()
    .allow("")
    .optional()
    .messages({
      "string.base": "The icon URL must be a string.",
      "string.max": `The icon URL must not exceed ${ICON_URL_MAX} characters.`,
    }),
});

export const getAllTypesSchema = Joi.object({
  universeId: universeIdSchema.optional(),
});
