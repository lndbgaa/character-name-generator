import Joi from "joi";

import { nameRegex, passwordRegex, usernameRegex } from "@/validators/patterns.js";

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

export const loginSchema = Joi.object({
  email: Joi.string().label("Email").trim().lowercase().email().required().messages({
    "string.base": "Email must be a string.",
    "string.empty": "Email must be a non-empty string.",
    "string.email": "Email must be a valid email address.",
    "any.required": "An email is required.",
  }),
  password: Joi.string().label("Password").trim().required().messages({
    "string.base": "Password must be a string.",
    "string.empty": "Password must be a non-empty string.",
    "any.required": "A password is required.",
  }),
});

export const registerSchema = Joi.object({
  email: Joi.string().label("Email").trim().lowercase().email().required().messages({
    "string.base": "Email must be a string.",
    "string.empty": "Email must be a non-empty string.",
    "string.email": "Email must be a valid email address.",
    "any.required": "An email is required.",
  }),
  password: Joi.string()
    .label("Password")
    .trim()
    .min(PLAIN_PASSWORD_MIN)
    .max(PLAIN_PASSWORD_MAX)
    .pattern(passwordRegex)
    .required()
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password must be a non-empty string.",
      "string.min": `Password must be at least ${PLAIN_PASSWORD_MIN} characters long.`,
      "string.max": `Password must not exceed ${PLAIN_PASSWORD_MAX} characters.`,
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and no spaces.",
      "any.required": "A password is required.",
    }),
  username: Joi.string()
    .label("Username")
    .trim()
    .min(USERNAME_MIN)
    .max(USERNAME_MAX)
    .pattern(usernameRegex)
    .required()
    .messages({
      "string.base": "Username must be a string.",
      "string.empty": "Username must be a non-empty string.",
      "string.min": `Username must be at least ${USERNAME_MIN} characters long.`,
      "string.max": `Username must not exceed ${USERNAME_MAX} characters.`,
      "string.pattern.base":
        "Username must start with a letter and contain only letters, digits, hyphens, and underscores.",
      "any.required": "A username is required.",
    }),
  firstName: Joi.string()
    .label("First Name")
    .trim()
    .min(FIRST_NAME_MIN)
    .max(FIRST_NAME_MAX)
    .pattern(nameRegex)
    .required()
    .messages({
      "string.base": "First Name must be a string.",
      "string.empty": "First Name must be a non-empty string.",
      "string.min": `First Name must be at least ${FIRST_NAME_MIN} characters long.`,
      "string.max": `First Name must not exceed ${FIRST_NAME_MAX} characters.`,
      "string.pattern.base":
        "First Name must start with a letter and contain only letters, spaces, apostrophes, or hyphens.",
      "any.required": "A first name is required.",
    }),

  lastName: Joi.string()
    .label("Last Name")
    .trim()
    .min(LAST_NAME_MIN)
    .max(LAST_NAME_MAX)
    .pattern(nameRegex)
    .required()
    .messages({
      "string.base": "Last Name must be a string.",
      "string.empty": "Last Name must be a non-empty string.",
      "string.min": `Last Name must be at least ${LAST_NAME_MIN} characters long.`,
      "string.max": `Last Name must not exceed ${LAST_NAME_MAX} characters.`,
      "string.pattern.base":
        "Last Name must start with a letter and contain only letters, spaces, apostrophes, or hyphens.",
      "any.required": "A last name is required.",
    }),
});

export const requestPasswordResetSchema = Joi.object({
  email: Joi.string().label("Email").trim().lowercase().email().required().messages({
    "string.base": "Email must be a string.",
    "string.empty": "Email must be a non-empty string.",
    "string.email": "Email must be a valid email address.",
    "any.required": "An email is required.",
  }),
});

export const verifyPasswordResetSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "string.base": "Password reset token must be a string.",
    "string.empty": "Password reset token must be a non-empty string.",
    "any.required": "A password reset token is required.",
  }),
});

export const passwordResetSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "string.base": "Password reset token must be a string.",
    "string.empty": "Password reset token must be a non-empty string.",
    "any.required": "A password reset token is required.",
  }),

  password: Joi.string()
    .label("Password")
    .trim()
    .min(PLAIN_PASSWORD_MIN)
    .max(PLAIN_PASSWORD_MAX)
    .pattern(passwordRegex)
    .required()
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password must be a non-empty string.",
      "string.min": `Password must be at least ${PLAIN_PASSWORD_MIN} characters long.`,
      "string.max": `Password must not exceed ${PLAIN_PASSWORD_MAX} characters.`,
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and no spaces.",
      "any.required": "A password is required.",
    }),
});
