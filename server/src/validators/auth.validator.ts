import Joi from "joi";

import { nameRegex, passwordRegex, usernameRegex } from "@/validators/patterns.js";

export const loginSchema = Joi.object({
  email: Joi.string().label("Email").trim().lowercase().email().required().messages({
    "any.required": "An email is required.",
    "string.base": "Email must be a string.",
    "string.empty": "Email must be a non-empty string.",
    "string.email": "Email must be a valid email address.",
  }),
  password: Joi.string().label("Password").trim().required().messages({
    "any.required": "A password is required.",
    "string.base": "Password must be a string.",
    "string.empty": "Password must be a non-empty string.",
  }),
});

export const registerSchema = Joi.object({
  email: Joi.string().label("Email").trim().lowercase().email().required().messages({
    "any.required": "An email is required.",
    "string.base": "Email must be a string.",
    "string.empty": "Email must be a non-empty string.",
    "string.email": "Email must be a valid email address.",
  }),
  password: Joi.string().label("Password").trim().min(8).max(100).pattern(passwordRegex).required().messages({
    "any.required": "A password is required.",
    "string.base": "Password must be a string.",
    "string.empty": "Password must be a non-empty string.",
    "string.min": "Password must be at least 8 characters long.",
    "string.max": "Password must not exceed 100 characters.",
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and no spaces.",
  }),
  username: Joi.string().label("Username").trim().min(3).max(20).pattern(usernameRegex).required().messages({
    "any.required": "A username is required.",
    "string.base": "Username must be a string.",
    "string.empty": "Username must be a non-empty string.",
    "string.min": "Username must be at least 3 characters long.",
    "string.max": "Username must not exceed 20 characters.",
    "string.pattern.base":
      "Username must start with a letter and contain only letters, digits, hyphens, and underscores.",
  }),
  firstName: Joi.string().label("First Name").trim().min(2).max(50).pattern(nameRegex).required().messages({
    "any.required": "First Name is required.",
    "string.base": "First Name must be a string.",
    "string.empty": "First Name must be a non-empty string.",
    "string.min": "First Name must be at least 2 characters long.",
    "string.max": "First Name must not exceed 50 characters.",
    "string.pattern.base":
      "First Name must start with a letter and contain only letters, spaces, apostrophes, or hyphens.",
  }),
  lastName: Joi.string().label("Last Name").trim().min(2).max(100).pattern(nameRegex).required().messages({
    "any.required": "Last Name is required.",
    "string.base": "Last Name must be a string.",
    "string.empty": "Last Name must be a non-empty string.",
    "string.min": "Last Name must be at least 2 characters long.",
    "string.max": "Last Name must not exceed 100 characters.",
    "string.pattern.base":
      "Last Name must start with a letter and contain only letters, spaces, apostrophes, or hyphens.",
  }),
});
