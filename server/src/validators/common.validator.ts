import Joi from "joi";

export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "any.required": "The element ID is required.",
    "string.base": "The element ID must be a string.",
    "string.empty": "The element ID must be a non-empty string.",
    "string.guid": "The element ID must be a valid identifier.",
  }),
});
