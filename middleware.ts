// CANONICAL: middleware.ts for Julley. Single source of truth for edge request policy.
//
// The Julley anchor is explicit: no accounts, no payments, no data collected.
// There is no session to refresh and no protected route to gate. This
// middleware does the four jobs a free anonymous tool actually needs:
//
//   1. Security headers on every response.
//   2. Deny-by-default CORS for /api/*. This API answers only the Julley site
//      itself. No Access-Control-Allow-Origin header is ever issued, OPTIONS
//      preflights get an explicit allow-nothing 204, and unsafe cross-origin
//      requests are rejected 403. This matters concretely: a hostile page
//      could otherwise fire a preflight-exempt text/plain POST at /api/lesson
//      (which parses its body as JSON regardless of content-type) and burn
//      the model budget that keeps Julley free.
//   3. Honest handling of auth-shaped URLs: /login, /signup and friends
//      redirect to the learn flow at /, because no account pages exist and
//      none will. A 404 would look broken; a redirect tells the truth.
//   4. Best effort per-IP rate limiting on unsafe /api/* methods so the
//      anonymous lesson composer cannot be farmed from a single address.
//      Counters live per serverless isolate; platform limits at deploy time
//      and input caps inside the API route complete the defense in depth.
//
// Error bodies use the product-wide { data, error } envelope so the learn
// flow surfaces these messages to students instead of a generic fallback.
//
// No Supabase client is used here on purpose. Catalog reads are anonymous,
// and RLS on the four julley_* catalog tables already allows SELECT for the
// anon role on active rows (policies exist in schema.sql), so no session
// machinery is needed anywhere in this product.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Security headers, applied to every matched response, including redirects,
// CORS refusals, and rate limit responses.
// ---------------------------------------------------------------------------
// Baseline Content-Security-Policy (QA-004). Every vector locks to 'self',
// with two documented loosenings that keep the framework functional:
//   * script-src 'unsafe-inline': the Next.js App Router streams its
//     hydration payload through framework-emitted inline <script> tags, and
//     per-request nonces would force the three static pages dynamic. Model
//     output is still rendered as text by React; this policy removes the
//     remote-script and exfiltration surface around it (no external scripts,
//     no objects, no off-origin form posts, no base hijacks, no embedding).
//   * style-src 'unsafe-inline': required by next/font and the landing
//     page's inline <style> block.
// connect-src also lists the Supabase origin so any browser-side catalog
// read keeps working; dev builds add 'unsafe-eval' for react fast refresh.
function cspConnectSrc(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return "connect-src 'self'"
  try {
    return `connect-src 'self' ${new URL(supabaseUrl).origin}`
  } catch {
    return "connect-src 'self'"
  }
}

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  process.env.NODE_ENV === 'development'
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  cspConnectSrc(),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  // Browser payment, camera, microphone and location APIs are switched off.
  // Julley never asks for money or hardware access.
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-DNS-Prefetch-Control': 'off',
}

function withSecurityHeaders<T extends Response>(res: T): T {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value)
  }
  return res
}

// ---------------------------------------------------------------------------
// Auth-shaped paths. Julley has no accounts, so these URLs go home to the
// learn flow. The list is limited to unambiguous auth paths so this file
// never shadows a page another build step legitimately owns (for example
// /about is injected by the deploy layer and /sonam belongs to core).
// ---------------------------------------------------------------------------
const AUTH_PAGE_PATHS = new Set([
  '/login',
  '/signin',
  '/sign-in',
  '/signup',
  '/sign-up',
  '/register',
  '/forgot-password',
  '/reset-password',
])

function isAuthShapedPath(pathname: string): boolean {
  if (AUTH_PAGE_PATHS.has(pathname)) return true
  if (pathname === '/auth' || pathname.startsWith('/auth/')) return true
  return false
}

// ---------------------------------------------------------------------------
// Deny-by-default CORS for /api/*.
// Same-origin browser requests carry an Origin header whose host matches the
// request host: allowed. Non-browser clients send no Origin header: allowed
// here, and handled by rate limiting. Anything else, including the literal
// Origin value 'null' from sandboxed iframes, is refused for unsafe methods.
// ---------------------------------------------------------------------------
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function requestHosts(request: NextRequest): Set<string> {
  const hosts = new Set<string>()
  const host = request.headers.get('host')
  if (host) hosts.add(host)
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedHost) {
    const first = forwardedHost.split(',')[0]?.trim()
    if (first) hosts.add(first)
  }
  if (request.nextUrl.host) hosts.add(request.nextUrl.host)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl) {
    try {
      hosts.add(new URL(appUrl).host)
    } catch {
      // Unset or malformed at build time: the header-derived hosts suffice.
    }
  }
  return hosts
}

function isCrossOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    return !requestHosts(request).has(new URL(origin).host)
  } catch {
    // 'null' or malformed Origin values are never trusted with unsafe methods.
    return true
  }
}

// ---------------------------------------------------------------------------
// Best effort fixed-window rate limiter for unsafe /api/* methods.
// Per-isolate memory, fails open by design: losing a counter can never take
// the product down, it can only briefly widen the window. Ten lesson
// requests per minute is generous for one student and hostile to a farm.
// ---------------------------------------------------------------------------
const WINDOW_MS = 60_000
const MAX_POSTS_PER_WINDOW = 10
const MAX_TRACKED_CLIENTS = 5_000

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

// QA-003: key the flood guard on a platform-verified IP first, matching
// clientKeyFromRequest() in app/api/lesson/route.ts. A non-browser client
// cannot forge Vercel's socket-derived request.ip or Netlify's edge-set
// x-nf-client-connection-ip, so it cannot rotate buckets to slip past this
// coarse guard. Only when both verified signals are absent do we fall back
// to the FIRST x-forwarded-for entry (one spoofable key per request, not an
// attacker-appended chain), then x-real-ip. Residual risk, accepted: hosts
// providing neither verified signal remain forgeable here; deploy-time
// platform limits and the route limiter are the backstop.
function clientKey(request: NextRequest): string {
  const vercelIp =
    'ip' in request && typeof request.ip === 'string' ? request.ip.trim() : ''
  if (vercelIp) return vercelIp
  const netlifyIp = request.headers.get('x-nf-client-connection-ip')?.trim()
  if (netlifyIp) return netlifyIp
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip') ?? 'unknown'
}

function isRateLimited(
  key: string,
  now: number,
): { limited: boolean; retryAfterSeconds: number } {
  // Lazy sweep so the map cannot grow without bound inside one isolate.
  if (buckets.size >= MAX_TRACKED_CLIENTS) {
    buckets.forEach((bucket, k) => {
      if (bucket.resetAt <= now) buckets.delete(k)
    })
    if (buckets.size >= MAX_TRACKED_CLIENTS) buckets.clear()
  }

  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { limited: false, retryAfterSeconds: 0 }
  }

  existing.count += 1
  if (existing.count > MAX_POSTS_PER_WINDOW) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }
  return { limited: false, retryAfterSeconds: 0 }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. No accounts exist. Auth-shaped URLs redirect to the learn flow.
  if (isAuthShapedPath(pathname)) {
    return withSecurityHeaders(NextResponse.redirect(new URL('/', request.url), 307))
  }

  if (pathname.startsWith('/api/')) {
    // 2a. CORS preflights get an explicit, allow-nothing answer. Without
    // Access-Control-Allow-* headers, browsers refuse the cross-origin call.
    if (request.method === 'OPTIONS') {
      const res = new NextResponse(null, { status: 204 })
      res.headers.set('Vary', 'Origin')
      return withSecurityHeaders(res)
    }

    // 2b. Unsafe cross-origin requests are refused outright, closing the
    // preflight-exempt text/plain loophole against the lesson budget.
    if (UNSAFE_METHODS.has(request.method) && isCrossOrigin(request)) {
      const res = NextResponse.json(
        {
          data: null,
          error: {
            code: 'cross_origin_denied',
            message: 'This API answers only the Julley site itself.',
          },
        },
        { status: 403 },
      )
      res.headers.set('Vary', 'Origin')
      return withSecurityHeaders(res)
    }

    // 3. Rate limit unsafe API calls — EXCEPT /api/lesson, which is owned by
    // the DURABLE Postgres limiter inside the route (julley_rate_check: per-IP
    // daily + global daily, atomic, survives cold starts). This per-isolate
    // memory guard was worthless against a farm for lessons (QA-003/QA-013:
    // counters reset on cold start, one counter per instance) and its second,
    // differently-worded 429 violated QA-002. It stays only as a coarse flood
    // guard for the OTHER unsafe API routes.
    if (UNSAFE_METHODS.has(request.method) && pathname !== '/api/lesson') {
      const { limited, retryAfterSeconds } = isRateLimited(clientKey(request), Date.now())
      if (limited) {
        const res = NextResponse.json(
          {
            data: null,
            error: {
              code: 'slow_down',
              message:
                'You are learning fast. Julley stays free for everyone, so each device gets a few lessons per minute. Please try again in about a minute.',
            },
          },
          { status: 429 },
        )
        res.headers.set('Retry-After', String(retryAfterSeconds))
        return withSecurityHeaders(res)
      }
    }
  }

  // 4. Everything else passes through with hardened headers.
  return withSecurityHeaders(NextResponse.next())
}

export const config = {
  // Match every page and API route. Skip Next internals; static assets pick
  // up headers too, which is harmless and keeps this matcher simple.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
