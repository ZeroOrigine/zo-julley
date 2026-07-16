// CANONICAL: /api/auth/* catch-all for Julley.
//
// Covers every auth-shaped API path a client, template, or habit might call:
// /api/auth/callback, /api/auth/confirm, /api/auth/signout, and anything
// else. Julley has no accounts by design, so all of them get the same
// honest, stateless 404. This file is standalone on purpose (inline-first
// rule): it imports nothing from other route files.
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

// rate-limit-exempt: free-product reject stub — no model call, no write, constant response
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
