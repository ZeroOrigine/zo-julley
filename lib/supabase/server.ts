// CANONICAL server-side Supabase client for Julley (route handlers and server code).
//
// WHY THERE IS NO COOKIE OR SESSION HANDLING HERE:
// Julley's product anchor is explicit: no accounts, no payments, no data
// collected, no users table. There is nothing to read from or write to auth
// cookies, so the cookie adapter below is a deliberate no-op and this client
// always acts as the anonymous role. Row Level Security on the four julley_*
// catalog tables allows SELECT of active rows only, and no write policies
// exist, so this client can never mutate anything.
//
// Required environment variables (set on the host, never hardcoded):
//   NEXT_PUBLIC_SUPABASE_URL       Supabase project URL (client-safe)
//   NEXT_PUBLIC_SUPABASE_ANON_KEY  Supabase anon key, RLS enforced (client-safe)
//
// Lazy initialization on purpose: no module-level throw, so a missing env var
// can never crash `next build` (see BUILDER-DEPLOY-CHECKLIST rule 4.1).

import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the deployment environment.'
    );
  }

  cachedClient = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // Julley has no auth sessions, so there are never cookies to read.
        return [];
      },
      setAll() {
        // Julley never sets auth cookies: there are no accounts by design.
      },
    },
  });

  return cachedClient;
}
