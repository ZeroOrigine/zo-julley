// CANONICAL: /api/billing for Julley.
//
// Julley is permanently free. No subscriptions, no invoices, no billing
// portal, no Stripe customer records, and no julley billing tables in the
// shared database. This endpoint exists so any accidental call to a billing
// URL fails loudly and honestly instead of half-working. It reads no payment
// env vars and contacts no payment service.
// See docs/AUTH-AND-PAYMENTS.md before changing this file.

import { NextResponse } from 'next/server'

const NOTHING_TO_MANAGE = {
  available: false,
  product: 'julley',
  message:
    'There is no billing here. Julley has no subscriptions, no invoices, and no portal, because every lesson is free. Nothing to manage, ever.',
  links: { learn: '/', about: '/about' },
} as const

function refuse(): NextResponse {
  return NextResponse.json(NOTHING_TO_MANAGE, { status: 404 })
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
