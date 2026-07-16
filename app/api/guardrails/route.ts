// CANONICAL public catalog endpoint: GET /api/guardrails
// Returns the refuse-and-reteach categories (no exam answers, no essays to
// submit, no answer keys). Exposed publicly on purpose so the About page can
// show exactly what Julley refuses, straight from the live catalog.
// Supports ?page=&limit=.

import type { NextRequest } from 'next/server';
import { CatalogQueryError, listGuardrails } from '@/lib/db/catalog';
import { CATALOG_CACHE_HEADERS, jsonFail, jsonOk } from '@/lib/db/http';
import { parsePageParams, toPage } from '@/lib/db/pagination';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;

export async function GET(request: NextRequest) {
  try {
    const pageParams = parsePageParams(request.nextUrl.searchParams, { defaultLimit: DEFAULT_LIMIT });
    const { items, total } = await listGuardrails(pageParams);
    return jsonOk(toPage(items, total, pageParams), { headers: CATALOG_CACHE_HEADERS });
  } catch (error) {
    if (error instanceof CatalogQueryError) {
      console.error('[julley/api/guardrails]', error.message);
      return jsonFail(503, 'catalog_unavailable', 'We could not load the guardrails just now. Refresh in a moment.');
    }
    console.error('[julley/api/guardrails] unexpected:', error instanceof Error ? error.message : 'unknown');
    return jsonFail(500, 'internal_error', 'Something on our side stumbled. Please try again.');
  }
}
