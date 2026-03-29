import { NextResponse } from 'next/server';
import { getAuthenticatedUser, isAdminUser, isAuthorizedCronRequest } from '@/lib/apiAuth';
import { syncExpiredPromotions } from '@/lib/promotionExpirations';

async function isAllowed(request: Request) {
  if (isAuthorizedCronRequest(request)) {
    return true;
  }

  const auth = await getAuthenticatedUser(request);
  if (!auth) {
    return false;
  }

  return isAdminUser(auth.user.id);
}

export async function GET(request: Request) {
  if (!(await isAllowed(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await syncExpiredPromotions();
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  if (!(await isAllowed(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await syncExpiredPromotions();
  return NextResponse.json(result);
}
