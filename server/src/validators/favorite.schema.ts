import Joi from "joi";

import { NOTE_MAX } from "@/models/Favorite.model.js";

export const addFavoriteBodySchema = Joi.object({
  nameId: Joi.string().uuid().required().messages({
    "string.base": "Name ID must be a string.",
    "string.empty": "Name ID must be a non-empty string.",
    "string.guid": "Name ID must be a valid identifier.",
    "any.required": "A name ID is required.",
  }),
  note: Joi.string()
    .trim()
    .allow("")
    .max(NOTE_MAX)
    .optional()
    .messages({
      "string.base": "Note must be a string.",
      "string.max": `Note must not exceed ${NOTE_MAX} characters.`,
    }),
});

export const updateFavoriteBodySchema = Joi.object({
  note: Joi.string()
    .trim()
    .allow("")
    .max(NOTE_MAX)
    .optional()
    .messages({
      "string.base": "Note must be a string.",
      "string.max": `Note must not exceed ${NOTE_MAX} characters.`,
    }),
});
