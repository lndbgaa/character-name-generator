import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wraps an async Express handler and forwards errors to `next()`.
 *
 * Used to avoid repetitive try/catch blocks in controllers.
 */
function catchAsync(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    return fn(req, res, next).catch(next);
  };
}
export default catchAsync;
