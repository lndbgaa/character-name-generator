import type { NextFunction, Request, Response } from "express";
import type { Schema } from "joi";

type ValidationTarget = "body" | "params" | "query";

const validateAll = (schema: Schema, target: ValidationTarget = "body") => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const data = req[target] ?? {};
    await schema.validateAsync(data, { abortEarly: true, stripUnknown: true, convert: true });

    next();
  };
};

export default validateAll;
