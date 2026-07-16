// CANONICAL /dashboard route for Julley.
// Product anchor: Julley has no accounts, no login, and no per-user data, so
// a dashboard cannot exist without contradicting the promise. This route
// exists only so the conventional path never dead-ends: it hands the visitor
// straight to the learn flow, which is the whole product.

import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  redirect('/learn');
}
