import Joi from "joi";

import { labelRegex } from "@/validators/patterns.js";

import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  DISPLAY_NAME_MAX,
  DISPLAY_NAME_MIN,
  LABEL_MAX,
  LABEL_MIN,
} from "@/models/Universe.model.js";

export const universeIdSchema = Joi.number().integer().positive().required().messages({
  "number.base": "Universe ID must be a number.",
  "number.integer": "Universe ID must be an integer.",
  "number.positive": "Universe ID must be a positive number.",
  "any.required": "A universe ID is required.",
});

export const createUniverseSchema = Joi.object({
  label: Joi.string()
    .trim()
    .min(LABEL_MIN)
    .max(LABEL_MAX)
    .pattern(labelRegex)
    .required()
    .messages({
      "string.base": "Label must be a string.",
      "string.empty": "Label must be a non-empty string.",
      "string.min": `Label must be at least ${LABEL_MIN} characters long.`,
      "string.max": `Label must not exceed ${LABEL_MAX} characters.`,
      "string.pattern.base": "Label must contain only letters, numbers, and underscores.",
      "any.required": "A label is required.",
    }),
  displayName: Joi.string()
    .trim()
    .min(DISPLAY_NAME_MIN)
    .max(DISPLAY_NAME_MAX)
    .required()
    .messages({
      "string.base": "Display name must be a string.",
      "string.empty": "Display name must be a non-empty string.",
      "string.min": `Display name must be at least ${DISPLAY_NAME_MIN} characters long.`,
      "string.max": `Display name must not exceed ${DISPLAY_NAME_MAX} characters.`,
      "any.required": "A display name is required.",
    }),
  description: Joi.string()
    .trim()
    .min(DESCRIPTION_MIN)
    .max(DESCRIPTION_MAX)
    .required()
    .messages({
      "string.base": "Description must be a string.",
      "string.empty": "Description must be a non-empty string if provided.",
      "string.min": `Description must be at least ${DESCRIPTION_MIN} characters long.`,
      "string.max": `Description must not exceed ${DESCRIPTION_MAX} characters.`,
      "any.required": "A description is required.",
    }),
});

export const updateUniverseSchema = Joi.object({
  displayName: Joi.string()
    .trim()
    .min(DISPLAY_NAME_MIN)
    .max(DISPLAY_NAME_MAX)
    .optional()
    .messages({
      "string.base": "Display name must be a string.",
      "string.empty": "Display name must be a non-empty string.",
      "string.min": `Display name must be at least ${DISPLAY_NAME_MIN} characters long.`,
      "string.max": `Display name must not exceed ${DISPLAY_NAME_MAX} characters.`,
    }),
  description: Joi.string()
    .trim()
    .min(DESCRIPTION_MIN)
    .max(DESCRIPTION_MAX)
    .optional()
    .messages({
      "string.base": "Description must be a string.",
      "string.empty": "Description must be a non-empty string.",
      "string.min": `Description must be at least ${DESCRIPTION_MIN} characters long.`,
      "string.max": `Description must not exceed ${DESCRIPTION_MAX} characters.`,
    }),
});
