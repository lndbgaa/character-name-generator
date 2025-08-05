import Joi from "joi";

export const addFavoriteSchema = Joi.object({
  nameId: Joi.string().uuid().required().messages({
    "any.required": "The name ID is required.",
    "string.base": "The name ID must be a string.",
    "string.empty": "The name ID must be a non-empty string.",
    "string.guid": "The name ID must be a valid identifier.",
  }),
  note: Joi.string().trim().optional().messages({
    "string.base": "The note must be a string.",
    "string.empty": "The note must be a non-empty string.",
  }),
});

export const updateFavoriteSchema = Joi.object({
  note: Joi.string().trim().allow("").optional().messages({
    "string.base": "The note must be a string.",
  }),
})
  .min(1)
  .messages({
    "object.min": "The request body must contain at least one field to update.",
  });
