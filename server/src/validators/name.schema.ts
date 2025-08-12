import Joi from "joi";

import { VALUE_MAX, VALUE_MIN } from "@/models/Name.model.js";
import { genderIdSchema } from "@/validators/gender.schema.js";
import { nameRegex } from "@/validators/patterns.js";
import { typeIdSchema } from "@/validators/type.schema.js";

const valueField = Joi.string()
  .trim()
  .min(VALUE_MIN)
  .max(VALUE_MAX)
  .pattern(nameRegex)
  .required()
  .messages({
    "any.required": `The name value field is required.`,
    "string.base": `The name value must be a string.`,
    "string.empty": `The name value cannot be empty.`,
    "string.min": `The name value must have at least ${VALUE_MIN} characters.`,
    "string.max": `The name value must not exceed ${VALUE_MAX} characters.`,
    "string.pattern.base": `The name value must start with a letter and may only contain letters, spaces, hyphens (-), or apostrophes (’ or ').`,
  });

const lengthField = Joi.string()
  .lowercase()
  .valid("short", "medium", "long")
  .optional()
  .messages({
    "string.base": `The length must be a string.`,
    "any.only": `The length must be one of: "short", "medium", or "long".`,
  });

const charLengthField = Joi.number()
  .integer()
  .positive()
  .max(VALUE_MAX)
  .optional()
  .messages({
    "number.base": `The character length must be a number.`,
    "number.integer": `The character length must be an integer.`,
    "number.positive": `The character length must be a positive number.`,
    "number.max": `The character length must not exceed ${VALUE_MAX}.`,
  });

export const createNameSchema = Joi.object({
  value: valueField,
  typeId: typeIdSchema,
  genderId: genderIdSchema,
});

export const updateNameSchema = Joi.object({
  value: valueField.optional(),
  typeId: typeIdSchema.optional(),
  genderId: genderIdSchema.optional(),
});

export const getNamesSchema = Joi.object({
  search: Joi.string().trim().min(1).optional().messages({
    "string.base": `The search query must be a string.`,
    "string.empty": `The search query cannot be empty.`,
    "string.min": `The search query must contain at least 1 character.`,
  }),
  typeId: typeIdSchema.optional(),
  genderId: genderIdSchema.optional(),
  length: lengthField,
  charLength: charLengthField,
  status: Joi.string()
    .valid("active", "inactive", "archived")
    .optional()
    .messages({
      "string.base": `The status must be a string.`,
      "any.only": `The status must be one of: "active", "inactive", or "archived".`,
    }),
})
  .oxor("length", "charLength")
  .messages({
    "object.oxor": `You must provide either "length" or "charLength", not both.`,
  });

export const generateRandomNamesByTypeSchema = Joi.object({
  count: Joi.number()
    .integer()
    .positive()
    .max(50)
    .default(10)
    .optional()
    .messages({
      "number.base": `The count must be a number.`,
      "number.integer": `The count must be an integer.`,
      "number.positive": `The count must be a positive number.`,
      "number.max": `The count must not exceed 50.`,
    }),
  genderId: genderIdSchema.optional(),
  length: lengthField,
  charLength: charLengthField,
})
  .oxor("length", "charLength")
  .messages({
    "object.oxor": `You must provide either "length" or "charLength", not both.`,
  });
