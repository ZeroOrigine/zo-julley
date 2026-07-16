// CANONICAL public catalog endpoint: GET /api/spirit-lines
// Returns the active Julley philosophy closing lines. These are original
// product lines, not quotes attributed to any person. The /sonam dedication
// page can render them from here. Intentionally public: read-only catalog,
// no accounts in Julley. Supports ?page=&limit=.

import type { NextRequest } from 'next/server';
import { CatalogQueryError, listSpiritLines } from '@/lib/db/catalog';
import { CATALOG_CACHE_HEADERS, jsonFail, jsonOk } from '@/lib/db/http';
import { parsePageParams, toPage } from '@/lib/db/pagination';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;

export async function GET(request: NextRequest) {
  try {
    const pageParams = parsePageParams(request.nextUrl.searchParams, { defaultLimit: DEFAULT_LIMIT });
    const { items, total } = await listSpiritLines(pageParams);
    return jsonOk(toPage(items, total, pageParams), { headers: CATALOG_CACHE_HEADERS });
  } catch (error) {
    if (error instanceof CatalogQueryError) {
      console.error('[julley/api/spirit-lines]', error.message);
      return jsonFail(503, 'catalog_unavailable', 'We could not load the spirit lines just now. Refresh in a moment.');
    }
    console.error('[julley/api/spirit-lines] unexpected:', error instanceof Error ? error.message : 'unknown');
    return jsonFail(500, 'internal_error', 'Something on our side stumbled. Please try again.');
  }
}
