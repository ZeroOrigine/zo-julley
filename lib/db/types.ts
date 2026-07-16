// CANONICAL shared types for Julley's database rows, API envelope, and lesson shape.
//
// PRODUCT INVARIANTS (anchor supremacy):
//   Julley is permanently free: no accounts, no payments, no data collected,
//   no users table. Therefore this product has NO auth routes, NO checkout or
//   billing routes, NO Stripe webhook, and NO user-owned tables. Those route
//   families are also owned by the auth_payments step and must never be
//   generated here. Every endpoint in this step is intentionally public:
//   read-only catalog data plus one stateless lesson composition call.
//
// ENVIRONMENT VARIABLES USED BY THIS STEP'S CODE (never hardcoded):
//   NEXT_PUBLIC_SUPABASE_URL       (client-safe)  Supabase project URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY  (client-safe)  Supabase anon key, RLS enforced
//   ANTHROPIC_API_KEY              (server-only)  key for the single Claude Haiku lesson call
//   ANTHROPIC_MODEL                (server-only, optional) overrides the default Haiku model id

// ----------------------------------------------------------------------------
// Enum mirrors of the Postgres types (single source of truth in TypeScript;
// import these instead of redeclaring string unions elsewhere).
// ----------------------------------------------------------------------------

export const JULLEY_LANGUAGE_CATEGORIES = ['eighth_schedule', 'himalayan', 'world'] as const;
export type JulleyLanguageCategory = (typeof JULLEY_LANGUAGE_CATEGORIES)[number];

export const JULLEY_TEXT_DIRECTIONS = ['ltr', 'rtl'] as const;
export type JulleyTextDirection = (typeof JULLEY_TEXT_DIRECTIONS)[number];

// ----------------------------------------------------------------------------
// Catalog row shapes (explicit columns only; we never select('*')).
// ----------------------------------------------------------------------------

export interface JulleyLanguage {
  id: string;
  code: string;
  name_english: string;
  name_native: string;
  script: string;
  direction: JulleyTextDirection;
  category: JulleyLanguageCategory;
  sort_order: number;
}

export interface JulleyAgeBand {
  id: string;
  code: string;
  label: string;
  min_age: number;
  max_age: number;
  prompt_guidance: string;
  sort_order: number;
}

// List endpoints ship the summary (prompt_guidance stays server-side: the UI
// never needs it, so we save bandwidth).
export interface JulleyAgeBandSummary {
  id: string;
  code: string;
  label: string;
  min_age: number;
  max_age: number;
  sort_order: number;
}

export interface JulleySpiritLine {
  id: string;
  line_text: string;
  theme: string;
  sort_order: number;
}

// Shape returned by the julley_random_spirit_line() SQL function.
export interface JulleySpiritLinePick {
  line_text: string;
  theme: string;
}

export interface JulleyGuardrail {
  id: string;
  code: string;
  description: string;
  redirect_guidance: string;
  sort_order: number;
}

// ----------------------------------------------------------------------------
// API envelope: every Julley endpoint returns exactly one of these two shapes.
// ----------------------------------------------------------------------------

export interface ApiErrorBody {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export interface ApiSuccessEnvelope<T> {
  data: T;
  error: null;
}

export interface ApiFailureEnvelope {
  data: null;
  error: ApiErrorBody;
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiFailureEnvelope;

export interface PaginatedList<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// ----------------------------------------------------------------------------
// Lesson composition contract (POST /api/lesson).
// Nothing here is ever persisted: the lesson exists only in the response.
// ----------------------------------------------------------------------------

export interface LessonRequestBody {
  topic: string;
  place: string;
  languageCode: string;
  age: number;
}

export interface LessonSection {
  heading: string;
  body: string;
}

export interface LessonActivity {
  title: string;
  materials: string[];
  steps: string[];
}

export interface LessonSpiritLine {
  text: string;
  english: string;
  theme: string;
}

export interface LessonLanguageMeta {
  code: string;
  name_english: string;
  name_native: string;
  script: string;
  direction: JulleyTextDirection;
}

export interface LessonAgeBandMeta {
  code: string;
  label: string;
}

export interface ComposedLesson {
  refused: boolean;
  refusal_note: string | null;
  title: string;
  sections: LessonSection[];
  activity: LessonActivity;
  explain_back: string[];
  spirit_line: LessonSpiritLine;
  language: LessonLanguageMeta;
  age_band: LessonAgeBandMeta;
}
