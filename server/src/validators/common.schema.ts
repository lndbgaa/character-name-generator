import Joi from "joi";

import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_MAX_LIMIT,
} from "@/constants/pagination.constants.js";

export const idUuidParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.base": "Element ID must be a string.",
    "string.empty": "Element ID must be a non-empty string.",
    "string.guid": "Element ID must be a valid identifier.",
    "any.required": "The element ID is required.",
  }),
});

export const idIntParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "Element ID must be a number.",
    "number.integer": "Element ID must be an integer.",
    "number.positive": "Element ID must be a positive number.",
    "any.required": "The element ID is required.",
  }),
});

export const labelParamSchema = Joi.object({
  label: Joi.string().trim().required().messages({
    "string.base": "Element label must be a string.",
    "string.empty": "Element label must be a non-empty string.",
    "any.required": "The element label is required.",
  }),
});

export const pageQuerySchema = Joi.number()
  .integer()
  .min(1)
  .default(PAGINATION_DEFAULT_PAGE)
  .messages({
    "number.base": "Page must be a number.",
    "number.integer": "Page must be an integer.",
    "number.min": "Page must be at least 1.",
  });

export const limitQuerySchema = Joi.number()
  .integer()
  .min(1)
  .max(PAGINATION_MAX_LIMIT)
  .default(PAGINATION_DEFAULT_LIMIT)
  .messages({
    "number.base": "Limit must be a number.",
    "number.integer": "Limit must be an integer.",
    "number.min": "Limit must be at least 1.",
    "number.max": `Limit cannot exceed ${PAGINATION_MAX_LIMIT}.`,
  });
