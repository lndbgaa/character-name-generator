import Joi from "joi";

import { IMAGE_URL_MAX_LENGTH } from "@/constants/common.constants.js";
import {
  TYPE_DESCRIPTION_MAX_LENGTH,
  TYPE_DESCRIPTION_MIN_LENGTH,
  TYPE_DISPLAY_NAME_MAX_LENGTH,
  TYPE_DISPLAY_NAME_MIN_LENGTH,
  TYPE_LABEL_MAX_LENGTH,
  TYPE_LABEL_MIN_LENGTH,
} from "@/constants/type.constants.js";

import { hexColorRegex, labelRegex } from "@/validators/patterns.js";
import { genderLabelSchema } from "./gender.schema";

export const typeIdSchema = Joi.number().integer().positive().required().messages({
  "number.base": "Type ID must be a number.",
  "number.integer": "Type ID must be an integer.",
  "number.positive": "Type ID must be a positive number.",
  "any.required": "A type ID is required.",
});

export const typeLabelSchema = Joi.string().trim().required().messages({
  "string.base": "Type label must be a string.",
  "string.empty": "Type label must be a non-empty string.",
  "any.required": "A type label is required.",
});

export const createTypeSchema = Joi.object({
  universeLabel: Joi.string().trim().required().messages({
    "string.base": "Universe label must be a string.",
    "string.empty": "Universe label must be a non-empty string.",
    "any.required": "A universe label is required.",
  }),
  label: Joi.string()
    .trim()
    .min(TYPE_LABEL_MIN_LENGTH)
    .max(TYPE_LABEL_MAX_LENGTH)
    .pattern(labelRegex)
    .required()
    .messages({
      "string.base": "Label must be a string.",
      "string.empty": "Label must be a non-empty string.",
      "string.min": `Label must be at least ${TYPE_LABEL_MIN_LENGTH} characters long.`,
      "string.max": `Label must not exceed ${TYPE_LABEL_MAX_LENGTH} characters.`,
      "string.pattern.base": "Label must contain only letters, numbers, and underscores.",
      "any.required": "A label is required.",
    }),
  displayName: Joi.string()
    .trim()
    .min(TYPE_DISPLAY_NAME_MIN_LENGTH)
    .max(TYPE_DISPLAY_NAME_MAX_LENGTH)
    .required()
    .messages({
      "string.base": "Display name must be a string.",
      "string.empty": "Display name must be a non-empty string.",
      "string.min": `Display name must be at least ${TYPE_DISPLAY_NAME_MIN_LENGTH} characters long.`,
      "string.max": `Display name must not exceed ${TYPE_DISPLAY_NAME_MAX_LENGTH} characters.`,
      "any.required": "A display name is required.",
    }),
  description: Joi.string()
    .trim()
    .min(TYPE_DESCRIPTION_MIN_LENGTH)
    .max(TYPE_DESCRIPTION_MAX_LENGTH)
    .required()
    .messages({
      "string.base": "Description must be a string.",
      "string.empty": "Description must be a non-empty string.",
      "string.min": `Description must be at least ${TYPE_DESCRIPTION_MIN_LENGTH} characters long.`,
      "string.max": `Description must not exceed ${TYPE_DESCRIPTION_MAX_LENGTH} characters.`,
      "any.required": "A description is required.",
    }),
  colorTheme: Joi.object({
    primary: Joi.string().pattern(hexColorRegex).required().messages({
      "string.base": "Primary color must be a string.",
      "string.empty": "Primary color must be a non-empty string.",
      "string.pattern.base": "Primary color must be a valid hex color (e.g. #fff or #ffffff).",
      "any.required": "A primary color is required.",
    }),
    secondary: Joi.string().pattern(hexColorRegex).required().messages({
      "string.base": "Secondary color must be a string.",
      "string.empty": "Secondary color must be a non-empty string.",
      "string.pattern.base": "Secondary color must be a valid hex color (e.g. #fff or #ffffff).",
      "any.required": "A secondary color is required.",
    }),
  })
    .required()
    .messages({
      "object.base": "Color theme must be a valid object with primary and secondary colors.",
    }),
  iconUrl: Joi.string()
    .uri()
    .max(IMAGE_URL_MAX_LENGTH)
    .required()
    .messages({
      "string.base": "Icon URL must be a string.",
      "string.empty": "Icon URL must be a non-empty string.",
      "string.uri": "Icon URL must be a valid URI (e.g. https://example.com/icon.png).",
      "string.max": `Icon URL must not exceed ${IMAGE_URL_MAX_LENGTH} characters.`,
      "any.required": "An icon URL is required.",
    }),
  cardImageUrl: Joi.string()
    .uri()
    .max(IMAGE_URL_MAX_LENGTH)
    .required()
    .messages({
      "string.base": "Card image URL must be a string.",
      "string.empty": "Card image URL must be a non-empty string.",
      "string.uri": "Card image URL must be a valid URI (e.g. https://example.com/card.png).",
      "string.max": `Card image URL must not exceed ${IMAGE_URL_MAX_LENGTH} characters.`,
      "any.required": "A card image URL is required.",
    }),
  backgroundImageUrl: Joi.string()
    .uri()
    .max(IMAGE_URL_MAX_LENGTH)
    .required()
    .messages({
      "string.base": "Background image URL must be a string.",
      "string.empty": "Background image URL must be a non-empty string.",
      "string.uri": "Background image URL must be a valid URI (e.g. https://example.com/background.png).",
      "string.max": `Background image URL must not exceed ${IMAGE_URL_MAX_LENGTH} characters.`,
      "any.required": "A background image URL is required.",
    }),
  allowedGenderLabels: Joi.array().items(genderLabelSchema.optional()).min(1).required().messages({
    "array.base": "Allowed genders must be an array.",
    "array.min": "At least one gender must be provided.",
    "any.required": "Allowed genders are required.",
  }),
});

export const updateTypeSchema = Joi.object({
  displayName: Joi.string()
    .trim()
    .min(TYPE_DISPLAY_NAME_MIN_LENGTH)
    .max(TYPE_DISPLAY_NAME_MAX_LENGTH)
    .optional()
    .messages({
      "string.base": "Display name must be a string.",
      "string.empty": "Display name must be a non-empty string.",
      "string.min": `Display name must be at least ${TYPE_DISPLAY_NAME_MIN_LENGTH} characters long.`,
      "string.max": `Display name must not exceed ${TYPE_DISPLAY_NAME_MAX_LENGTH} characters.`,
    }),
  description: Joi.string()
    .trim()
    .min(TYPE_DESCRIPTION_MIN_LENGTH)
    .max(TYPE_DESCRIPTION_MAX_LENGTH)
    .optional()
    .messages({
      "string.base": "Description must be a string.",
      "string.empty": "Description must be a non-empty string.",
      "string.min": `Description must be at least ${TYPE_DESCRIPTION_MIN_LENGTH} characters long.`,
      "string.max": `Description must not exceed ${TYPE_DESCRIPTION_MAX_LENGTH} characters.`,
    }),
  colorTheme: Joi.object({
    primary: Joi.string().pattern(hexColorRegex).optional().messages({
      "string.base": "Primary color must be a string.",
      "string.empty": "Primary color must be a non-empty string.",
      "string.pattern.base": "Primary color must be a valid hex color (e.g. #fff or #ffffff).",
    }),
    secondary: Joi.string().pattern(hexColorRegex).optional().messages({
      "string.base": "Secondary color must be a string.",
      "string.empty": "Secondary color must be a non-empty string.",
      "string.pattern.base": "Secondary color must be a valid hex color (e.g. #fff or #ffffff).",
    }),
  })
    .or("primary", "secondary")
    .optional()
    .messages({
      "object.base": "Color theme must be a valid object.",
      "object.missing": "When updating color theme, provide at least 'primary' or 'secondary'.",
    }),
  iconUrl: Joi.string()
    .uri()
    .max(IMAGE_URL_MAX_LENGTH)
    .optional()
    .messages({
      "string.base": "Icon URL must be a string.",
      "string.empty": "Icon URL must be a non-empty string.",
      "string.uri": "Icon URL must be a valid URI (e.g. https://example.com/icon.png).",
      "string.max": `Icon URL must not exceed ${IMAGE_URL_MAX_LENGTH} characters.`,
    }),
  cardImageUrl: Joi.string()
    .uri()
    .max(IMAGE_URL_MAX_LENGTH)
    .optional()
    .messages({
      "string.base": "Card image URL must be a string.",
      "string.empty": "Card image URL must be a non-empty string.",
      "string.uri": "Card image URL must be a valid URI (e.g. https://example.com/card.png).",
      "string.max": `Card image URL must not exceed ${IMAGE_URL_MAX_LENGTH} characters.`,
    }),
  backgroundImageUrl: Joi.string()
    .uri()
    .max(IMAGE_URL_MAX_LENGTH)
    .optional()
    .messages({
      "string.base": "Background image URL must be a string.",
      "string.empty": "Background image URL must be a non-empty string.",
      "string.uri": "Background image URL must be a valid URI (e.g. https://example.com/background.png).",
      "string.max": `Background image URL must not exceed ${IMAGE_URL_MAX_LENGTH} characters.`,
    }),
});

export const getAllTypesSchema = Joi.object({
  universeLabel: Joi.string().trim().optional().messages({
    "string.base": "Universe label must be a string.",
    "string.empty": "Universe label must be a non-empty string.",
  }),
});
