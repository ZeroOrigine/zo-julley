// CANONICAL public catalog endpoint: GET /api/languages/[code]
// Fetches one language by its lowercase code, so a deep-linked lesson page
// can resolve script and text direction (ltr or rtl) server-side.
// Intentionally public: read-only catalog, no accounts exist in Julley.

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { CatalogQueryError, getLanguageByCode } from '@/lib/db/catalog';
import { CATALOG_CACHE_HEADERS, jsonFail, jsonOk } from '@/lib/db/http';

export const dynamic = 'force-dynamic';

const languageCodeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z]{2,12}$/, 'Language codes are 2 to 12 lowercase letters.');

export async function GET(
  _request: NextRequest,
  context: { params: { code: string } }
) {
  try {
    const parsedCode = languageCodeSchema.safeParse(context.params.code);
    if (!parsedCode.success) {
      return jsonFail(400, 'invalid_language_code', 'Language codes are 2 to 12 lowercase letters.', {
        fields: { code: 'Language codes are 2 to 12 lowercase letters.' },
      });
    }

    const language = await getLanguageByCode(parsedCode.data);
    if (!language) {
      return jsonFail(404, 'language_not_found', 'We could not find that language. Pick one from the language list.');
    }

    return jsonOk(language, { headers: CATALOG_CACHE_HEADERS });
  } catch (error) {
    if (error instanceof CatalogQueryError) {
      console.error('[julley/api/languages/code]', error.message);
      return jsonFail(503, 'catalog_unavailable', 'We could not load that language just now. Refresh in a moment.');
    }
    console.error('[julley/api/languages/code] unexpected:', error instanceof Error ? error.message : 'unknown');
    return jsonFail(500, 'internal_error', 'Something on our side stumbled. Please try again.');
  }
}
