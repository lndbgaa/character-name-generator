import Joi from "joi";

import { GENDERS_LABEL } from "@/constants/gender.constants.js";

export const genderIdSchema = Joi.number().integer().positive().required().messages({
  "number.base": "Gender ID must be a number.",
  "number.integer": "Gender ID must be an integer.",
  "number.positive": "Gender ID must be a positive number.",
  "any.required": "A gender ID is required.",
});

export const genderLabelSchema = Joi.string()
  .lowercase()
  .valid(...Object.values(GENDERS_LABEL))
  .required()
  .messages({
    "string.base": "Gender label must be a string.",
    "string.empty": "Gender label must be a non-empty string.",
    "any.only": `Gender label must be one of the following values: ${Object.values(GENDERS_LABEL).join(", ")}.`,
    "any.required": "A gender label is required.",
  });
