// CANONICAL API response helpers for Julley route handlers.
// One envelope everywhere: { data, error }. Success carries data and a null
// error; failure carries a null data and a human-readable error with a stable
// machine code. Internal details are logged server-side, never sent to users.

import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';
import type { ApiErrorBody } from '@/lib/db/types';

export interface ResponseOptions {
  status?: number;
  headers?: Record<string, string>;
}

export interface FailureOptions {
  fields?: Record<string, string>;
  headers?: Record<string, string>;
}

export function jsonOk<T>(data: T, options?: ResponseOptions): NextResponse {
  return NextResponse.json(
    { data, error: null },
    { status: options?.status ?? 200, headers: options?.headers }
  );
}

export function jsonFail(
  status: number,
  code: string,
  message: string,
  options?: FailureOptions
): NextResponse {
  const error: ApiErrorBody = { code, message };
  if (options?.fields && Object.keys(options.fields).length > 0) {
    error.fields = options.fields;
  }
  return NextResponse.json({ data: null, error }, { status, headers: options?.headers });
}

// Turns a ZodError into a field -> first-message map for 400 responses.
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : 'body';
    if (!(key in fields)) {
      fields[key] = issue.message;
    }
  }
  return fields;
}

// Catalog data changes rarely (service-role edits only), so CDN caching is
// safe and keeps the language picker instant worldwide.
export const CATALOG_CACHE_HEADERS: Record<string, string> = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
};

// Lesson responses reflect what a student typed. Product promise: no data
// collected. Never cache them anywhere.
export const NO_STORE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
};
