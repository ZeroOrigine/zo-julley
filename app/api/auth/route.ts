// CANONICAL: /api/auth for Julley (base path; the catch-all sibling at
// app/api/auth/[...path]/route.ts covers every deeper segment).
//
// Julley has no accounts by design. The anchor says: no accounts, no
// payments, no data collected, no users table. No Supabase auth session is
// ever created, no auth cookies are ever set, and no auth emails are ever
// sent. Any call to an auth API path gets this honest, stateless answer.
// See docs/AUTH-AND-PAYMENTS.md before changing this file.

import { NextResponse } from 'next/server'

const NO_ACCOUNTS = {
  available: false,
  product: 'julley',
  message:
    'Julley has no accounts. There is nothing to sign in to and nothing to sign up for. Open the home page, type your topic, your place, and your language, and start learning.',
  links: { learn: '/', about: '/about' },
} as const

function refuse(): NextResponse {
  return NextResponse.json(NO_ACCOUNTS, { status: 404 })
}

export function GET() {
  return refuse()
}

export function POST() {
  return refuse()
}

export function PUT() {
  return refuse()
}

export function PATCH() {
  return refuse()
}

export function DELETE() {
  return refuse()
}
