import Joi from "joi";

export const genderIdSchema = Joi.number().integer().positive().required().messages({
  "any.required": "The gender ID is required.",
  "number.base": "The gender ID must be a number.",
  "number.integer": "The gender ID must be an integer.",
  "number.positive": "The gender ID must be a positive number.",
});
