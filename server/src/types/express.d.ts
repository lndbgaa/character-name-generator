import type { CustomJwtPayload } from "@/types/auth.types";
import type { Request } from "express";

export interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}

export {};
