import { getReasonPhrase } from "http-status-codes";

import { GENERIC_ERROR_MESSAGE } from "@/constants/error.constants.js";

import type { ErrorDetails } from "@/types/error.types.js";

/**
 * Custom error with HTTP status (code/text), optional code, debug message, and details.
 */
class CustomError extends Error {
  public readonly statusCode: number;
  public readonly statusText: string;
  public readonly debugMessage?: string;
  public readonly code?: string;
  public readonly details?: ErrorDetails;
  public readonly isOperational: boolean;

  private static resolveStatusText(code: number, fallback = "Error"): string {
    try {
      return getReasonPhrase(code);
    } catch {
      return fallback;
    }
  }

  constructor({
    statusCode = 500,
    statusText,
    message = GENERIC_ERROR_MESSAGE,
    debugMessage,
    code,
    details,
    isOperational = true,
  }: {
    statusCode?: number;
    statusText?: string;
    message?: string;
    debugMessage?: string;
    code?: string;
    details?: ErrorDetails;
    isOperational?: boolean;
  }) {
    super(message);
    this.name = "CustomError";
    this.debugMessage = debugMessage;
    this.statusCode = statusCode;
    this.statusText = statusText || CustomError.resolveStatusText(statusCode);
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
