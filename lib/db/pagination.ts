// CANONICAL pagination helpers for Julley list endpoints.
// Every list endpoint accepts ?page=&limit=. Limits are clamped to a hard
// maximum of 100 so no request can ask the database for an unbounded scan.

import type { PaginatedList } from '@/lib/db/types';

export interface PageParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PageOptions {
  // Per-route default. The languages route defaults to 100 because the whole
  // point of the product is a picker that shows all 37 languages at once.
  defaultLimit: number;
  maxLimit?: number;
}

const HARD_MAX_LIMIT = 100;
const HARD_MAX_PAGE = 1000;

export function parsePageParams(searchParams: URLSearchParams, options: PageOptions): PageParams {
  const maxLimit = Math.min(options.maxLimit ?? HARD_MAX_LIMIT, HARD_MAX_LIMIT);

  const rawPage = Number.parseInt(searchParams.get('page') ?? '', 10);
  const rawLimit = Number.parseInt(searchParams.get('limit') ?? '', 10);

  const page = Number.isInteger(rawPage) && rawPage >= 1 ? Math.min(rawPage, HARD_MAX_PAGE) : 1;
  const requestedLimit =
    Number.isInteger(rawLimit) && rawLimit >= 1 ? rawLimit : options.defaultLimit;
  const limit = Math.min(requestedLimit, maxLimit);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function toPage<T>(items: T[], total: number, params: PageParams): PaginatedList<T> {
  return {
    items,
    page: params.page,
    limit: params.limit,
    total,
    hasMore: params.offset + items.length < total,
  };
}
