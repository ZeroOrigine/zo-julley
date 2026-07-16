// CANONICAL public endpoint: GET /api/spirit-lines/random
// Returns one random active spirit line via the julley_random_spirit_line()
// SQL function (invoker rights, so anon RLS still applies). Served with
// no-store so every request gets a fresh line. Intentionally public.

import { CatalogQueryError, getRandomSpiritLine } from '@/lib/db/catalog';
import { jsonFail, jsonOk, NO_STORE_HEADERS } from '@/lib/db/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const line = await getRandomSpiritLine();
    if (!line) {
      return jsonFail(404, 'spirit_lines_empty', 'No spirit lines are available right now. Refresh in a moment.');
    }
    return jsonOk(line, { headers: NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof CatalogQueryError) {
      console.error('[julley/api/spirit-lines/random]', error.message);
      return jsonFail(503, 'catalog_unavailable', 'We could not pick a spirit line just now. Refresh in a moment.');
    }
    console.error('[julley/api/spirit-lines/random] unexpected:', error instanceof Error ? error.message : 'unknown');
    return jsonFail(500, 'internal_error', 'Something on our side stumbled. Please try again.');
  }
}
