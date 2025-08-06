import Joi from "joi";

export const idUuidParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "any.required": "The element ID is required.",
    "string.base": "The element ID must be a string.",
    "string.empty": "The element ID must be a non-empty string.",
    "string.guid": "The element ID must be a valid identifier.",
  }),
});

export const idIntParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "any.required": "The element ID is required.",
    "number.base": "The element ID must be a number.",
    "number.integer": "The element ID must be an integer.",
    "number.positive": "The element ID must be a positive number.",
  }),
});
