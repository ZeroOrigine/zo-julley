// CANONICAL: /api/checkout for Julley.
//
// Julley is permanently free. The anchor says: no accounts, no payments,
// no data collected. This endpoint exists for one reason only: if any client
// code, crawler, or future change ever calls a checkout URL on this product,
// it must fail loudly and honestly instead of half-working. Nothing here
// talks to Stripe or to the central payments proxy, no payment env vars are
// read, and the shared database holds no julley billing tables by design.
// See docs/AUTH-AND-PAYMENTS.md before changing this file.

import { NextResponse } from 'next/server'

const NOTHING_TO_BUY = {
  available: false,
  product: 'julley',
  message:
    'There is no checkout here. Julley is free for every student, with no accounts and no payments. Head to the home page and start learning.',
  links: { learn: '/', about: '/about', dedication: '/sonam' },
} as const

function refuse(): NextResponse {
  return NextResponse.json(NOTHING_TO_BUY, { status: 404 })
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
