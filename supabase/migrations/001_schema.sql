-- ============================================================================
-- JULLEY :: PostgreSQL schema (Supabase, shared ZeroOrigine database)
--
-- Product anchor: a permanently free, no-login web tool that retells any
-- school topic through a student's own place and mother tongue, adds one
-- hands-on task, and refuses exam answers. Three pages: learn flow, /sonam,
-- /about. One serverless Claude Haiku call composes each lesson. The anchor
-- states explicitly: no accounts, no payments, no data collected, no users
-- table.
--
-- DELIBERATE OMISSIONS (anchor supremacy; the coherence gate hard-fails if
-- the schema implements what the landing page promises does not exist):
--   * No julley_profiles table and no handle_new_user() trigger on
--     auth.users: the product has no accounts. Extending auth.users would
--     contradict the product promise "no accounts, no users table".
--   * No julley_subscriptions, no julley_payments, no julley_stripe_events:
--     the product is permanently free with no billing of any kind. There is
--     no Stripe state to store, so billing tables would be dishonest schema.
--   * No lesson/request/log tables: "no data collected" is a product promise.
--     The topic, place, and language a student types exist only inside the
--     single serverless call and are never written to this database.
--
-- WHAT REMAINS: read-only catalog/config tables. They carry no user data and
-- no user-referencing columns (no user_id, email, owner_id, created_by).
-- They power the 37-language picker (with right-to-left rendering flags),
-- age tuning, the refuse-and-reteach guardrails, and the closing spirit line.
--
-- ARTIFACT MANIFEST DECLARATION (deploy layer auto-approves anon read):
--   public_content_tables:
--   ["julley_languages","julley_age_bands","julley_spirit_lines","julley_guardrails"]
--   Each table below is SELECT-only for anon/authenticated. All writes are
--   service-role only (service role bypasses RLS; no write policies exist).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------

CREATE TYPE julley_text_direction AS ENUM ('ltr', 'rtl');

CREATE TYPE julley_language_category AS ENUM ('eighth_schedule', 'himalayan', 'world');

-- ----------------------------------------------------------------------------
-- TABLE: julley_languages
-- The 37 supported lesson languages. 22 Eighth Schedule Indian languages,
-- Ladakhi (Bhoti), English, and 13 more world languages. direction = 'rtl'
-- for exactly Urdu, Arabic, Kashmiri, Sindhi, and Persian.
-- ----------------------------------------------------------------------------

CREATE TABLE julley_languages (
  id           uuid                      DEFAULT gen_random_uuid() PRIMARY KEY,
  code         text                      NOT NULL UNIQUE
               CHECK (code = lower(code) AND char_length(code) BETWEEN 2 AND 12),
  name_english text                      NOT NULL,
  name_native  text                      NOT NULL,
  script       text                      NOT NULL,
  direction    julley_text_direction     NOT NULL DEFAULT 'ltr',
  category     julley_language_category  NOT NULL,
  is_active    boolean                   NOT NULL DEFAULT true,
  sort_order   integer                   NOT NULL DEFAULT 0,
  created_at   timestamptz               NOT NULL DEFAULT now(),
  updated_at   timestamptz               NOT NULL DEFAULT now()
);

COMMENT ON TABLE julley_languages IS
  'Public catalog of the 37 lesson languages. No user data. Anon read-only; writes via service role.';
COMMENT ON COLUMN julley_languages.direction IS
  'Text direction for lesson rendering. rtl applies to Urdu, Arabic, Kashmiri, Sindhi, Persian.';

-- ----------------------------------------------------------------------------
-- TABLE: julley_age_bands
-- Age tuning presets for students aged 10 to 18. prompt_guidance is fed into
-- the serverless composition call so tone can be tuned without a redeploy.
-- ----------------------------------------------------------------------------

CREATE TABLE julley_age_bands (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  code            text        NOT NULL UNIQUE,
  label           text        NOT NULL,
  min_age         smallint    NOT NULL,
  max_age         smallint    NOT NULL,
  prompt_guidance text        NOT NULL,
  is_active       boolean     NOT NULL DEFAULT true,
  sort_order      integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT julley_age_bands_range_chk CHECK (min_age >= 6 AND max_age <= 19 AND min_age < max_age)
);

COMMENT ON TABLE julley_age_bands IS
  'Public catalog of age tuning presets. No user data. Anon read-only; writes via service role.';

-- ----------------------------------------------------------------------------
-- TABLE: julley_spirit_lines
-- Original closing lines from the Julley philosophy. One is appended to every
-- lesson and rendered natively in the chosen language by the model. These are
-- original product lines, not quotes attributed to any person.
-- ----------------------------------------------------------------------------

CREATE TABLE julley_spirit_lines (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  line_text  text        NOT NULL UNIQUE,
  theme      text        NOT NULL,
  is_active  boolean     NOT NULL DEFAULT true,
  sort_order integer     NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE julley_spirit_lines IS
  'Public catalog of original philosophy closing lines. No user data. Anon read-only; writes via service role.';

-- ----------------------------------------------------------------------------
-- TABLE: julley_guardrails
-- Refuse-and-reteach categories. The serverless call loads these so the
-- refusal behavior (no exam answers, no submittable essays) is data-driven.
-- ----------------------------------------------------------------------------

CREATE TABLE julley_guardrails (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  code              text        NOT NULL UNIQUE,
  description       text        NOT NULL,
  redirect_guidance text        NOT NULL,
  is_active         boolean     NOT NULL DEFAULT true,
  sort_order        integer     NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE julley_guardrails IS
  'Public catalog of refuse-and-reteach guardrail categories. No user data. Anon read-only; writes via service role.';

-- ----------------------------------------------------------------------------
-- INDEXES
-- (No foreign keys exist between these independent catalogs. UNIQUE columns
-- above already carry unique indexes. Partial indexes match the only query
-- shape used: WHERE is_active = true ORDER BY sort_order.)
-- ----------------------------------------------------------------------------

CREATE INDEX julley_languages_active_sort_idx
  ON julley_languages (sort_order) WHERE is_active = true;

CREATE INDEX julley_languages_active_category_idx
  ON julley_languages (category, sort_order) WHERE is_active = true;

CREATE INDEX julley_age_bands_active_sort_idx
  ON julley_age_bands (sort_order) WHERE is_active = true;

CREATE INDEX julley_spirit_lines_active_sort_idx
  ON julley_spirit_lines (sort_order) WHERE is_active = true;

CREATE INDEX julley_guardrails_active_sort_idx
  ON julley_guardrails (sort_order) WHERE is_active = true;

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Every table: RLS enabled. SELECT-only policies for anon and authenticated,
-- scoped to active rows. No INSERT/UPDATE/DELETE policies exist, so only the
-- service role (which bypasses RLS) can write. These four tables are declared
-- in public_content_tables (see header) and carry no user-referencing column.
-- ----------------------------------------------------------------------------

ALTER TABLE julley_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE julley_age_bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE julley_spirit_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE julley_guardrails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "julley_languages_public_read" ON julley_languages
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "julley_age_bands_public_read" ON julley_age_bands
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "julley_spirit_lines_public_read" ON julley_spirit_lines
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "julley_guardrails_public_read" ON julley_guardrails
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- ----------------------------------------------------------------------------
-- FUNCTIONS & TRIGGERS
-- Function names are product-prefixed to avoid collisions in the shared
-- database. handle_new_user() is intentionally absent: no accounts exist.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION julley_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER julley_languages_set_updated_at
  BEFORE UPDATE ON julley_languages
  FOR EACH ROW EXECUTE FUNCTION julley_set_updated_at();

CREATE TRIGGER julley_age_bands_set_updated_at
  BEFORE UPDATE ON julley_age_bands
  FOR EACH ROW EXECUTE FUNCTION julley_set_updated_at();

CREATE TRIGGER julley_spirit_lines_set_updated_at
  BEFORE UPDATE ON julley_spirit_lines
  FOR EACH ROW EXECUTE FUNCTION julley_set_updated_at();

CREATE TRIGGER julley_guardrails_set_updated_at
  BEFORE UPDATE ON julley_guardrails
  FOR EACH ROW EXECUTE FUNCTION julley_set_updated_at();

-- Domain helper: picks one active spirit line at random for the lesson close.
-- Runs as invoker, so anon access still flows through the RLS SELECT policy.
CREATE OR REPLACE FUNCTION julley_random_spirit_line()
RETURNS TABLE (line_text text, theme text)
LANGUAGE sql
SET search_path = public
AS $$
  SELECT s.line_text, s.theme
  FROM julley_spirit_lines s
  WHERE s.is_active = true
  ORDER BY random()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION julley_random_spirit_line() TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- SEED DATA: languages
-- 37 total = 22 Eighth Schedule + Ladakhi (Bhoti) + English + 13 more world
-- languages. Exactly five rtl rows: Kashmiri, Sindhi, Urdu, Arabic, Persian.
-- ----------------------------------------------------------------------------

INSERT INTO julley_languages (code, name_english, name_native, script, direction, category, sort_order) VALUES
  ('as',  'Assamese',           'অসমীয়া',          'Bengali-Assamese', 'ltr', 'eighth_schedule', 10),
  ('bn',  'Bengali',            'বাংলা',            'Bengali-Assamese', 'ltr', 'eighth_schedule', 20),
  ('brx', 'Bodo',               'बड़ो',              'Devanagari',       'ltr', 'eighth_schedule', 30),
  ('doi', 'Dogri',              'डोगरी',             'Devanagari',       'ltr', 'eighth_schedule', 40),
  ('gu',  'Gujarati',           'ગુજરાતી',           'Gujarati',         'ltr', 'eighth_schedule', 50),
  ('hi',  'Hindi',              'हिन्दी',             'Devanagari',       'ltr', 'eighth_schedule', 60),
  ('kn',  'Kannada',            'ಕನ್ನಡ',             'Kannada',          'ltr', 'eighth_schedule', 70),
  ('ks',  'Kashmiri',           'کٲشُر',             'Perso-Arabic',     'rtl', 'eighth_schedule', 80),
  ('gom', 'Konkani',            'कोंकणी',            'Devanagari',       'ltr', 'eighth_schedule', 90),
  ('mai', 'Maithili',           'मैथिली',            'Devanagari',       'ltr', 'eighth_schedule', 100),
  ('ml',  'Malayalam',          'മലയാളം',           'Malayalam',        'ltr', 'eighth_schedule', 110),
  ('mni', 'Manipuri (Meitei)',  'ꯃꯤꯇꯩꯂꯣꯟ',          'Meitei Mayek',     'ltr', 'eighth_schedule', 120),
  ('mr',  'Marathi',            'मराठी',             'Devanagari',       'ltr', 'eighth_schedule', 130),
  ('ne',  'Nepali',             'नेपाली',            'Devanagari',       'ltr', 'eighth_schedule', 140),
  ('or',  'Odia',               'ଓଡ଼ିଆ',             'Odia',             'ltr', 'eighth_schedule', 150),
  ('pa',  'Punjabi',            'ਪੰਜਾਬੀ',            'Gurmukhi',         'ltr', 'eighth_schedule', 160),
  ('sa',  'Sanskrit',           'संस्कृतम्',           'Devanagari',       'ltr', 'eighth_schedule', 170),
  ('sat', 'Santali',            'ᱥᱟᱱᱛᱟᱲᱤ',          'Ol Chiki',         'ltr', 'eighth_schedule', 180),
  ('sd',  'Sindhi',             'سنڌي',             'Perso-Arabic',     'rtl', 'eighth_schedule', 190),
  ('ta',  'Tamil',              'தமிழ்',             'Tamil',            'ltr', 'eighth_schedule', 200),
  ('te',  'Telugu',             'తెలుగు',            'Telugu',           'ltr', 'eighth_schedule', 210),
  ('ur',  'Urdu',               'اردو',              'Perso-Arabic',     'rtl', 'eighth_schedule', 220),
  ('lbj', 'Ladakhi (Bhoti)',    'ལ་དྭགས་སྐད',        'Tibetan',          'ltr', 'himalayan',       230),
  ('en',  'English',            'English',          'Latin',            'ltr', 'world',           240),
  ('ar',  'Arabic',             'العربية',           'Arabic',           'rtl', 'world',           250),
  ('fr',  'French',             'Français',         'Latin',            'ltr', 'world',           260),
  ('ha',  'Hausa',              'Hausa',            'Latin',            'ltr', 'world',           270),
  ('id',  'Indonesian',         'Bahasa Indonesia', 'Latin',            'ltr', 'world',           280),
  ('ja',  'Japanese',           '日本語',            'Japanese',         'ltr', 'world',           290),
  ('zh',  'Chinese (Mandarin)', '中文',              'Han (Simplified)', 'ltr', 'world',           300),
  ('fa',  'Persian',            'فارسی',            'Perso-Arabic',     'rtl', 'world',           310),
  ('pt',  'Portuguese',         'Português',        'Latin',            'ltr', 'world',           320),
  ('ru',  'Russian',            'Русский',          'Cyrillic',         'ltr', 'world',           330),
  ('es',  'Spanish',            'Español',          'Latin',            'ltr', 'world',           340),
  ('sw',  'Swahili',            'Kiswahili',        'Latin',            'ltr', 'world',           350),
  ('tr',  'Turkish',            'Türkçe',           'Latin',            'ltr', 'world',           360),
  ('vi',  'Vietnamese',         'Tiếng Việt',       'Latin',            'ltr', 'world',           370)
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- SEED DATA: age bands
-- ----------------------------------------------------------------------------

INSERT INTO julley_age_bands (code, label, min_age, max_age, prompt_guidance, sort_order) VALUES
  ('ages_10_12', 'Ages 10 to 12', 10, 12,
   'Use short sentences and concrete objects the child can see or hold. One idea at a time. Playful, warm, and encouraging. Compare everything to daily chores, games, animals, food, and family life around the child.',
   10),
  ('ages_13_15', 'Ages 13 to 15', 13, 15,
   'Use everyday mechanics and cause-and-effect. Connect the concept to work, weather, markets, tools, and phones around the student. Respectful, curious tone. Introduce the proper technical terms after the local retelling, never before it.',
   20),
  ('ages_16_18', 'Ages 16 to 18', 16, 18,
   'Allow abstraction, but anchor it in livelihood, land, and community first. Connect the concept honestly to exams without giving answers, and to the future the student can build where they live. Speak to them as a capable young adult.',
   30)
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- SEED DATA: guardrails (refuse and reteach)
-- ----------------------------------------------------------------------------

INSERT INTO julley_guardrails (code, description, redirect_guidance, sort_order) VALUES
  ('exam_answer',
   'The student asks for the answer to an exam, test, or homework question.',
   'Refuse to hand over the answer. Say it plainly and kindly. Reteach the underlying concept through the student''s own place, then ask the student to explain it back in their own words.',
   10),
  ('essay_submission',
   'The student asks for an essay, letter, or assignment written for them to submit.',
   'Never produce text meant to be submitted. Teach the structure instead: what to observe locally, how to order their own thoughts, and one opening pattern they can build from themselves.',
   20),
  ('answer_key',
   'The student pastes a full problem set or question paper and asks for it to be solved.',
   'Do not solve the set. Find the one concept the set is really testing, reteach it through free local materials, then walk through a single similar practice path without giving final answers.',
   30)
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- SEED DATA: spirit lines
-- Original Julley philosophy lines. Not quotes attributed to any person.
-- ----------------------------------------------------------------------------

INSERT INTO julley_spirit_lines (line_text, theme, sort_order) VALUES
  ('You are not behind. The book was simply written for somewhere else.', 'dignity', 10),
  ('Your place is not a poor example. It is a whole laboratory.', 'local_worth', 20),
  ('A concept you can touch is a concept you keep.', 'hands_on', 30),
  ('If you can teach it to your grandmother, you have learned it twice.', 'explain_back', 40),
  ('Marks fade. What your hands remember stays.', 'beyond_exams', 50),
  ('Ice is stored on the mountain so the valley can drink in spring. Store your learning where your life will need it.', 'local_worth', 60),
  ('Your language is not small. It has carried your people this far.', 'mother_tongue', 70),
  ('Learn it, do it, explain it. Then it is yours.', 'explain_back', 80)
ON CONFLICT (line_text) DO NOTHING;

-- ----------------------------------------------------------------------------
-- SEED VERIFICATION (transaction-safe assertions; fail loudly, never silently)
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  n_total integer;
  n_rtl   integer;
BEGIN
  SELECT count(*) INTO n_total FROM julley_languages WHERE is_active = true;
  IF n_total <> 37 THEN
    RAISE EXCEPTION 'julley_languages seed expected 37 active languages, found %', n_total;
  END IF;

  SELECT count(*) INTO n_rtl FROM julley_languages WHERE is_active = true AND direction = 'rtl';
  IF n_rtl <> 5 THEN
    RAISE EXCEPTION 'julley_languages seed expected exactly 5 rtl languages (Urdu, Arabic, Kashmiri, Sindhi, Persian), found %', n_rtl;
  END IF;
END $$;

-- ============================================================================
-- END OF SCHEMA. Four catalog tables, RLS on all, SELECT-only for anon and
-- authenticated, service-role-only writes, zero user data by design.
-- ============================================================================

-- Self-validation patches
-- No schema patch required. Re-verified in self-validation:
--   * RLS enabled on all four julley_* tables with SELECT-only policies for
--     anon/authenticated scoped to is_active = true; zero write policies, so
--     writes are service-role only.
--   * No hardcoded secrets; no user-referencing columns anywhere.
--   * Partial indexes match the only query shape used
--     (WHERE is_active = true ORDER BY sort_order); no foreign keys exist by
--     design between independent catalogs.
--   * Seed assertions fail loudly if 37 active languages or exactly 5 rtl
--     rows are not present.
-- Deliberate omissions (profiles, subscriptions, payments, lesson logs)
-- remain correct under anchor supremacy: implementing them would contradict
-- the product promise and hard-fail the coherence gate.