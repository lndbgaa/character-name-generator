import Joi from "joi";

import { limitQuerySchema, pageQuerySchema } from "@/validators/common.schema.js";

import { nameRegex, passwordRegex, usernameRegex } from "@/validators/patterns.js";

import {
  ACCOUNT_ALLOWED_SORT_FIELDS,
  ACCOUNT_ROLES_LABEL,
  ACCOUNT_STATUSES,
} from "@/constants/user.constants.js";

import {
  FIRST_NAME_MAX,
  FIRST_NAME_MIN,
  LAST_NAME_MAX,
  LAST_NAME_MIN,
  PLAIN_PASSWORD_MAX,
  PLAIN_PASSWORD_MIN,
  USERNAME_MAX,
  USERNAME_MIN,
} from "@/models/User.model.js";

export const updateProfileBodySchema = Joi.object({
  username: Joi.string()
    .label("Username")
    .trim()
    .min(USERNAME_MIN)
    .max(USERNAME_MAX)
    .pattern(usernameRegex)
    .optional()
    .messages({
      "string.base": "Username must be a string.",
      "string.empty": "Username must be a non-empty string.",
      "string.min": `Username must be at least ${USERNAME_MIN} characters long.`,
      "string.max": `Username must not exceed ${USERNAME_MAX} characters.`,
      "string.pattern.base":
        "Username must start with a letter and contain only letters, digits, hyphens, and underscores.",
    }),
  firstName: Joi.string()
    .label("First Name")
    .trim()
    .min(FIRST_NAME_MIN)
    .max(FIRST_NAME_MAX)
    .pattern(nameRegex)
    .optional()
    .messages({
      "string.base": "First Name must be a string.",
      "string.empty": "First Name must be a non-empty string.",
      "string.min": `First Name must be at least ${FIRST_NAME_MIN} characters long.`,
      "string.max": `First Name must not exceed ${FIRST_NAME_MAX} characters.`,
      "string.pattern.base":
        "First Name must start with a letter and contain only letters, spaces, apostrophes, or hyphens.",
    }),
  lastName: Joi.string()
    .label("Last Name")
    .trim()
    .min(LAST_NAME_MIN)
    .max(LAST_NAME_MAX)
    .pattern(nameRegex)
    .optional()
    .messages({
      "string.base": "Last Name must be a string.",
      "string.empty": "Last Name must be a non-empty string.",
      "string.min": `Last Name must be at least ${LAST_NAME_MIN} characters long.`,
      "string.max": `Last Name must not exceed ${LAST_NAME_MAX} characters.`,
      "string.pattern.base":
        "Last Name must start with a letter and contain only letters, spaces, apostrophes, or hyphens.",
    }),
  password: Joi.string()
    .label("Password")
    .trim()
    .min(PLAIN_PASSWORD_MIN)
    .max(PLAIN_PASSWORD_MAX)
    .pattern(passwordRegex)
    .optional()
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password must be a non-empty string.",
      "string.min": `Password must be at least ${PLAIN_PASSWORD_MIN} characters long.`,
      "string.max": `Password must not exceed ${PLAIN_PASSWORD_MAX} characters.`,
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and no spaces.",
    }),
});

export const getUsersQuerySchema = Joi.object({
  page: pageQuerySchema,

  limit: limitQuerySchema,

  search: Joi.string().trim().min(1).optional().messages({
    "string.base": "Search must be a string.",
    "string.empty": "Search cannot be an empty string.",
    "string.min": "Search must contain at least one character.",
  }),

  role: Joi.string()
    .valid(...Object.values(ACCOUNT_ROLES_LABEL))
    .optional()
    .messages({
      "string.base": "Role must be a string.",
      "any.only": `Role must be one of the following values: ${Object.values(
        ACCOUNT_ROLES_LABEL
      ).join(", ")}.`,
    }),

  status: Joi.string()
    .valid(...Object.values(ACCOUNT_STATUSES))
    .optional()
    .messages({
      "string.base": "Status must be a string.",
      "any.only": `Status must be one of the following values: ${Object.values(
        ACCOUNT_STATUSES
      ).join(", ")}.`,
    }),

  sortBy: Joi.string()
    .valid(...ACCOUNT_ALLOWED_SORT_FIELDS)
    .default("created_at")
    .messages({
      "string.base": "SortBy must be a string.",
      "any.only": `SortBy must be one of the following fields: ${ACCOUNT_ALLOWED_SORT_FIELDS.join(
        ", "
      )}.`,
    }),

  sortDir: Joi.string().trim().lowercase().valid("asc", "desc").default("desc").messages({
    "string.base": "SortDir must be a string.",
    "any.only": "SortDir must be either 'asc' or 'desc'.",
  }),
});
