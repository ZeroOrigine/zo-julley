// CANONICAL data-access layer for Julley's four public catalog tables.
// Service-oriented rule: route handlers call these functions and never touch
// Supabase directly. Every query selects explicit columns, filters on
// is_active = true (matching the partial indexes), and orders by sort_order.
// This layer only READS. Julley collects no data, so nothing here writes.

import { getSupabaseServerClient } from '@/lib/supabase/server';
import type {
  JulleyAgeBand,
  JulleyAgeBandSummary,
  JulleyGuardrail,
  JulleyLanguage,
  JulleyLanguageCategory,
  JulleySpiritLine,
  JulleySpiritLinePick,
} from '@/lib/db/types';

export class CatalogQueryError extends Error {
  constructor(source: string, detail: string) {
    super('Catalog query failed on ' + source + ': ' + detail);
    this.name = 'CatalogQueryError';
  }
}

export interface ListParams {
  page: number;
  limit: number;
  offset: number;
}

export interface ListResult<T> {
  items: T[];
  total: number;
}

const LANGUAGE_COLUMNS = 'id, code, name_english, name_native, script, direction, category, sort_order';
const AGE_BAND_SUMMARY_COLUMNS = 'id, code, label, min_age, max_age, sort_order';
const AGE_BAND_FULL_COLUMNS = 'id, code, label, min_age, max_age, prompt_guidance, sort_order';
const SPIRIT_LINE_COLUMNS = 'id, line_text, theme, sort_order';
const GUARDRAIL_COLUMNS = 'id, code, description, redirect_guidance, sort_order';

export async function listLanguages(
  params: ListParams & { category?: JulleyLanguageCategory }
): Promise<ListResult<JulleyLanguage>> {
  const supabase = getSupabaseServerClient();

  let query = supabase
    .from('julley_languages')
    .select(LANGUAGE_COLUMNS, { count: 'exact' })
    .eq('is_active', true);

  if (params.category) {
    query = query.eq('category', params.category);
  }

  const { data, error, count } = await query
    .order('sort_order', { ascending: true })
    .range(params.offset, params.offset + params.limit - 1);

  if (error) {
    throw new CatalogQueryError('julley_languages', error.message);
  }
  return { items: (data ?? []) as unknown as JulleyLanguage[], total: count ?? 0 };
}

export async function getLanguageByCode(code: string): Promise<JulleyLanguage | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('julley_languages')
    .select(LANGUAGE_COLUMNS)
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new CatalogQueryError('julley_languages', error.message);
  }
  return data ? ((data as unknown) as JulleyLanguage) : null;
}

export async function listAgeBands(params: ListParams): Promise<ListResult<JulleyAgeBandSummary>> {
  const supabase = getSupabaseServerClient();

  const { data, error, count } = await supabase
    .from('julley_age_bands')
    .select(AGE_BAND_SUMMARY_COLUMNS, { count: 'exact' })
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .range(params.offset, params.offset + params.limit - 1);

  if (error) {
    throw new CatalogQueryError('julley_age_bands', error.message);
  }
  return { items: (data ?? []) as unknown as JulleyAgeBandSummary[], total: count ?? 0 };
}

// Maps a raw age (10 to 18) to its tuning band, including prompt_guidance for
// the composition call. Returns null only if catalog data changed unexpectedly.
export async function findAgeBandForAge(age: number): Promise<JulleyAgeBand | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('julley_age_bands')
    .select(AGE_BAND_FULL_COLUMNS)
    .eq('is_active', true)
    .lte('min_age', age)
    .gte('max_age', age)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new CatalogQueryError('julley_age_bands', error.message);
  }
  return data ? ((data as unknown) as JulleyAgeBand) : null;
}

export async function listSpiritLines(params: ListParams): Promise<ListResult<JulleySpiritLine>> {
  const supabase = getSupabaseServerClient();

  const { data, error, count } = await supabase
    .from('julley_spirit_lines')
    .select(SPIRIT_LINE_COLUMNS, { count: 'exact' })
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .range(params.offset, params.offset + params.limit - 1);

  if (error) {
    throw new CatalogQueryError('julley_spirit_lines', error.message);
  }
  return { items: (data ?? []) as unknown as JulleySpiritLine[], total: count ?? 0 };
}

// Uses the julley_random_spirit_line() SQL function (invoker rights, so the
// anon RLS SELECT policy still applies).
export async function getRandomSpiritLine(): Promise<JulleySpiritLinePick | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase.rpc('julley_random_spirit_line');

  if (error) {
    throw new CatalogQueryError('julley_random_spirit_line', error.message);
  }

  const row: unknown = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') {
    return null;
  }
  const pick = row as { line_text?: unknown; theme?: unknown };
  if (typeof pick.line_text !== 'string' || typeof pick.theme !== 'string') {
    return null;
  }
  return { line_text: pick.line_text, theme: pick.theme };
}

export async function listGuardrails(params: ListParams): Promise<ListResult<JulleyGuardrail>> {
  const supabase = getSupabaseServerClient();

  const { data, error, count } = await supabase
    .from('julley_guardrails')
    .select(GUARDRAIL_COLUMNS, { count: 'exact' })
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .range(params.offset, params.offset + params.limit - 1);

  if (error) {
    throw new CatalogQueryError('julley_guardrails', error.message);
  }
  return { items: (data ?? []) as unknown as JulleyGuardrail[], total: count ?? 0 };
}
