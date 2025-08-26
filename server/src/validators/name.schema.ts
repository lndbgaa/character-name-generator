import Joi from "joi";

import {
  DEFAULT_RANDOM_NAMES,
  MAX_RANDOM_NAMES,
  NAME_LENGTHS,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_SORT_FIELDS,
  NAME_STATUSES,
} from "@/constants/name.constants.js";

import { limitQuerySchema, pageQuerySchema } from "@/validators/common.schema.js";
import { genderLabelSchema } from "@/validators/gender.schema.js";
import { nameRegex } from "@/validators/patterns.js";
import { typeLabelSchema } from "@/validators/type.schema.js";

const valueField = Joi.string()
  .trim()
  .min(NAME_MIN_LENGTH)
  .max(NAME_MAX_LENGTH)
  .pattern(nameRegex)
  .required()
  .messages({
    "string.base": "Name value must be a string.",
    "string.empty": "Name value must be a non-empty string.",
    "string.min": `Name value must be at least ${NAME_MIN_LENGTH} characters long.`,
    "string.max": `Name value must not exceed ${NAME_MAX_LENGTH} characters.`,
    "string.pattern.base":
      "Name value must start with a letter and may only contain letters, spaces, hyphens (-), or apostrophes (’ or ').",
    "any.required": "A name value is required.",
  });

const lengthField = Joi.string()
  .lowercase()
  .valid(...Object.values(NAME_LENGTHS))
  .optional()
  .messages({
    "string.base": "Length must be a string.",
    "string.empty": "Length must be a non-empty string.",
    "any.only": `Length must be one of the following values: ${Object.values(NAME_LENGTHS).join(", ")}.`,
  });

const charLengthField = Joi.number()
  .integer()
  .positive()
  .max(NAME_MAX_LENGTH)
  .optional()
  .messages({
    "number.base": "Character length must be a number.",
    "number.integer": "Character length must be an integer.",
    "number.positive": "Character length must be a positive number.",
    "number.max": `Character length must not exceed ${NAME_MAX_LENGTH}.`,
  });

export const createNameBodySchema = Joi.object({
  value: valueField.required(),
  typeLabel: typeLabelSchema.required(),
  genderLabel: genderLabelSchema.required(),
});

export const updateNameBodySchema = Joi.object({
  value: valueField.optional(),
  typeLabel: typeLabelSchema.optional(),
  genderLabel: genderLabelSchema.optional(),
});

export const getNamesQuerySchema = Joi.object({
  page: pageQuerySchema,

  limit: limitQuerySchema,

  search: Joi.string().trim().optional().messages({
    "string.base": "Search query must be a string.",
    "string.empty": "Search query must be a non-empty string.",
  }),

  typeLabel: typeLabelSchema.optional(),

  genderLabel: genderLabelSchema.optional(),

  length: lengthField.optional(),

  charLength: charLengthField.optional(),

  status: Joi.string()
    .lowercase()
    .valid(...Object.values(NAME_STATUSES))
    .optional()
    .messages({
      "string.base": "Status must be a string.",
      "any.only": `Status must be one of the following values: ${Object.values(NAME_STATUSES).join(", ")}.`,
    }),

  sortBy: Joi.string()
    .lowercase()
    .valid(...NAME_SORT_FIELDS)
    .default("created_at")
    .messages({
      "string.base": "SortBy must be a string.",
      "any.only": `SortBy must be one of the following fields: ${NAME_SORT_FIELDS.join(", ")}.`,
    }),

  sortDir: Joi.string().lowercase().valid("asc", "desc").default("desc").messages({
    "string.base": "SortDir must be a string.",
    "any.only": "SortDir must be either 'asc' or 'desc'.",
  }),
})
  .oxor("length", "charLength")
  .messages({
    "object.oxor": 'You must provide either "length" or "charLength", not both.',
  });

export const generateRandomNamesByTypeQuerySchema = Joi.object({
  size: Joi.number()
    .integer()
    .positive()
    .max(MAX_RANDOM_NAMES)
    .default(DEFAULT_RANDOM_NAMES)
    .optional()
    .messages({
      "number.base": "Sizet must be a number.",
      "number.integer": "Size must be an integer.",
      "number.positive": "Size must be a positive number.",
      "number.max": `Size must not exceed ${MAX_RANDOM_NAMES}.`,
    }),

  genderLabel: genderLabelSchema.optional(),

  length: lengthField.optional(),

  charLength: charLengthField.optional(),
})
  .oxor("length", "charLength")
  .messages({
    "object.oxor": 'You must provide either "length" or "charLength", not both.',
  });
