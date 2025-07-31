import type { CustomJwtPayload } from "@/types/auth.d.ts";

declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}
