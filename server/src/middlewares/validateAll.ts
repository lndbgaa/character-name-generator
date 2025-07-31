import type { NextFunction, Request, Response } from "express";
import type { ObjectSchema } from "joi";

type ValidationTarget = "body" | "params" | "query";

const validateAll = (schema: ObjectSchema, target: ValidationTarget = "body") => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const data = req[target] ?? {};
    await schema.validateAsync(data, { abortEarly: false, stripUnknown: true });
    next();
  };
};

export default validateAll;
