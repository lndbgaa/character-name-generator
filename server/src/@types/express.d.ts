import type { CustomJwtPayload } from "@/types/auth.types.js";

declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}

export {};
