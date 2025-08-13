import type { Request } from "express";

const MAX_LIMIT = 50;

/**
 * Parses pagination parameters from the request query.
 *
 * @param {Request} req - Express request object.
 * @returns {{ page: number, limit: number, offset: number }} Pagination data.
 */
function parsePagination(req: Request): { page: number; limit: number; offset: number } {
  const rawPage = parseInt(req.query.page as string, 10);
  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const rawLimit = parseInt(req.query.limit as string, 10);
  const limit = Math.min(Number.isNaN(rawLimit) || rawLimit < 1 ? 10 : rawLimit, MAX_LIMIT);

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export default parsePagination;
