// REMOVED in builder self-validation (deterministic lint: dead_module).
//
// Julley has no browser-side Supabase usage and must not gain one casually:
//   * Every client component reads catalog data through the public API routes
//     (/api/languages, /api/age-bands, /api/spirit-lines, /api/guardrails),
//     which add CDN cache headers and the shared { data, error } envelope.
//   * Server code uses lib/supabase/server.ts exclusively.
//   * A browser Supabase client would add roughly 35KB gzipped of SDK to the
//     student-facing bundle (students on cheap phones and slow networks are
//     the audience) to open a second, uncached data path. That trade is bad.
//
// This file now exports NOTHING and exists only as a tombstone so the build
// system can delete it outright. If a future feature genuinely needs a
// browser Supabase client, recreate it deliberately with a named consumer,
// never speculatively.
