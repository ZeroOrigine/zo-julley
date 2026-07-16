<!-- CANONICAL: Julley auth and payments stance. Intentional design, not a gap. -->

# Julley: auth and payments stance

Read this before adding any auth or billing code to this repo.

## The anchor decides

The Julley anchor states: 'Permanently free: no accounts, no payments, no data collected, no users table.' The schema enforces the same promise: four read-only catalog tables (julley_languages, julley_age_bands, julley_spirit_lines, julley_guardrails), no profiles, no subscriptions, no payment or Stripe event tables. The coherence gate hard-fails any step that implements what the promise says does not exist.

So the generic auth plus payments step resolves, for this product, into a guard step. It ships the security layer a free anonymous tool actually needs, and it makes the absence of accounts and billing explicit, executable, and testable.

## What this step ships

| File | Purpose |
| --- | --- |
| middleware.ts | Security headers on every response. Deny-by-default CORS on /api/*: no Access-Control-Allow-Origin is ever issued, OPTIONS answers an allow-nothing 204, and cross-origin POST/PUT/PATCH/DELETE get 403 (closes the preflight-exempt text/plain loophole against the lesson budget). Redirects auth-shaped URLs (/login, /signin, /signup, /register, /forgot-password, /reset-password, /auth/*) to /. Best effort per-IP limit of 10 unsafe /api/* requests per minute. Error bodies use the product-wide { data, error } envelope so the learn flow surfaces them. |
| app/api/checkout/route.ts | Honest 404 JSON. No Stripe SDK, no central payments proxy call, no payment env vars. |
| app/api/billing/route.ts | Honest 404 JSON. There is no subscription to manage. |
| app/api/auth/route.ts and app/api/auth/[...path]/route.ts | Honest 404 JSON for any auth API call. |

## Generic step requirements, resolved for Julley

| Generic requirement | Resolution |
| --- | --- |
| Supabase auth clients and session middleware | Not built. No sessions exist. Anonymous catalog reads go through the server client owned by the api step (lib/supabase/server.ts) and are covered by the SELECT-only RLS policies for anon on active rows of the four julley_* tables, exactly as written in schema.sql. There is no browser Supabase client: client components read catalogs via the cached /api/* routes. |
| Login, signup, password reset pages | Not built. Middleware redirects those URLs to /. A login page on a no-login product would be a false promise. |
| Protected /dashboard routes | None exist. /dashboard redirects to /learn. The learn flow is public by design. |
| Stripe client, checkout, portal, webhooks | Not built. The central payments service never receives a Julley event because Julley never creates a checkout session. |
| Pricing tiers (Free, Pro, Enterprise) | One tier: free, forever, for everyone. Not represented in code because nothing is gated. |
| Usage meters and plan limits | Replaced by anonymous per-IP rate limiting at the edge. |

## Security model

- No cookies are set and no sessions exist, so there is no session-based CSRF surface: every endpoint is stateless and anonymous. Additionally, unsafe cross-origin requests to /api/* are rejected at the edge, so even preflight-exempt tricks (text/plain posts) cannot spend the lesson budget from another site.
- CORS is deny-by-default: the API serves the Julley site only. No allow headers exist anywhere in the codebase.
- No card data, no email, no name, no PII is collected or stored. The topic, place, and language a student types exist only inside the single serverless composition call.
- All four tables are public catalogs: RLS enabled, SELECT allowed for anon and authenticated on active rows only, writes only via the service role. They are declared in public_content_tables and carry no user-referencing columns.
- Rate limiting layers: (1) middleware fixed window per IP, per isolate, best effort; (2) platform level limits recommended at deploy; (3) the api step caps input lengths, validates the language code against julley_languages, and keeps its own per-instance limiter before calling the model.
- Secrets: this step reads only NEXT_PUBLIC_APP_URL (client-safe, used to whitelist the canonical host for origin checks). ANTHROPIC_API_KEY (owned by the api step) is server-only and must never carry the NEXT_PUBLIC_ prefix.

## Env vars introduced by this step

None that are secret. NEXT_PUBLIC_APP_URL is read if present to strengthen the origin whitelist. Product-wide, for reference: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL (client-safe) and ANTHROPIC_API_KEY (server-only). No Stripe vars exist for this product. Deploy must not create Stripe products, prices, or webhook secrets for Julley. No Supabase auth redirect URLs are needed because no auth emails are ever sent.

## Verification (replaces the auth and Stripe gates for this product)

1. GET /login, /signup, /register, /forgot-password, /reset-password, and /auth/anything respond 307 to /.
2. Any method on /api/checkout, /api/billing, or /api/auth/anything responds 404 with the honest JSON body.
3. OPTIONS /api/lesson responds 204 with no Access-Control-Allow-Origin header; a POST to /api/lesson with header Origin: https://evil.example responds 403 with code cross_origin_denied.
4. The 11th POST within one minute from one IP to any /api/* route responds 429 with a Retry-After header and the { data, error } envelope.
5. Every page response carries X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security, and Permissions-Policy headers.
6. grep -ri 'stripe' over the repo source finds no Stripe SDK import and no payment env var reads.
7. Landing and /about copy state the same promise this layer enforces: free forever, no accounts, no data collected.

## If this ever changes

Adding accounts or payments to Julley would be a new anchor and a new build, not a patch. Delete this guard step consciously as part of that decision, never silently.
