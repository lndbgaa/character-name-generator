import { getReasonPhrase } from "http-status-codes";

import type { ErrorDetails } from "@/types/error.d.ts";

class CustomError extends Error {
  public readonly statusCode: number;
  public readonly statusText: string;
  public readonly code?: string;
  public readonly details?: ErrorDetails;
  public readonly isOperational: boolean;
  public readonly isPublic: boolean;

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
    message = "An unexpected error occured.",
    code,
    details,
    isOperational = true,
    isPublic = false,
  }: {
    statusCode?: number;
    statusText?: string;
    message?: string;
    code?: string;
    details?: ErrorDetails;
    isOperational?: boolean;
    isPublic?: boolean;
  }) {
    super(message);
    this.name = "CustomError";
    this.statusCode = statusCode;
    this.statusText = statusText || CustomError.resolveStatusText(statusCode);
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    this.isPublic = isPublic;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
