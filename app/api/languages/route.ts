// CANONICAL public catalog endpoint: GET /api/languages
// Returns the active lesson languages (37 seeded) with native names, scripts,
// text direction (rtl for Urdu, Arabic, Kashmiri, Sindhi, Persian), and
// category. Intentionally public: Julley has no accounts by product anchor,
// and the julley_languages table is a declared public catalog with a
// SELECT-only RLS policy for anon. Supports ?page=&limit=&category=.

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { CatalogQueryError, listLanguages } from '@/lib/db/catalog';
import { CATALOG_CACHE_HEADERS, jsonFail, jsonOk } from '@/lib/db/http';
import { parsePageParams, toPage } from '@/lib/db/pagination';
import { JULLEY_LANGUAGE_CATEGORIES, type JulleyLanguageCategory } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

// The language picker must show all 37 languages in one page, so the default
// limit is the hard maximum (100). Pagination still applies and is bounded.
const DEFAULT_LIMIT = 100;

const categorySchema = z.enum(JULLEY_LANGUAGE_CATEGORIES, {
  errorMap: () => ({ message: 'Category can be eighth_schedule, himalayan, or world.' }),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageParams = parsePageParams(searchParams, { defaultLimit: DEFAULT_LIMIT });

    let category: JulleyLanguageCategory | undefined;
    const rawCategory = searchParams.get('category');
    if (rawCategory !== null) {
      const parsedCategory = categorySchema.safeParse(rawCategory);
      if (!parsedCategory.success) {
        return jsonFail(400, 'invalid_category', 'Category can be eighth_schedule, himalayan, or world.', {
          fields: { category: 'Use eighth_schedule, himalayan, or world.' },
        });
      }
      category = parsedCategory.data;
    }

    const { items, total } = await listLanguages({ ...pageParams, category });
    return jsonOk(toPage(items, total, pageParams), { headers: CATALOG_CACHE_HEADERS });
  } catch (error) {
    if (error instanceof CatalogQueryError) {
      console.error('[julley/api/languages]', error.message);
      return jsonFail(503, 'catalog_unavailable', 'We could not load the languages just now. Refresh in a moment.');
    }
    console.error('[julley/api/languages] unexpected:', error instanceof Error ? error.message : 'unknown');
    return jsonFail(500, 'internal_error', 'Something on our side stumbled. Please try again.');
  }
}
