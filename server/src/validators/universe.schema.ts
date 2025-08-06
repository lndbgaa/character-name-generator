import Joi from "joi";

import { DESCRIPTION_MAX, DISPLAY_NAME_MAX, LABEL_MAX } from "@/models/Universe.js";
import { labelRegex } from "@/validators/patterns.js";

export const createUniverseSchema = Joi.object({
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
      "string.pattern.base": "The label can only contain letters, numbers, underscores, and hyphens.",
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
});

export const updateUniverseSchema = Joi.object({
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
});
