import { NextResponse } from 'next/server';
import { isAuthorizedCronRequest } from '@/lib/apiAuth';
import { reportError } from '@/lib/errorReporting';
import { syncExpiredPromotions } from '@/lib/promotionExpirations';

async function runExpireJob(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncExpiredPromotions();
    return NextResponse.json(result);
  } catch (error) {
    await reportError({
      source: 'promotion_expire_job',
      message: error instanceof Error ? error.message : 'Promotion expire job failed',
      severity: 'critical',
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Promotion expire job failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return runExpireJob(request);
}

export async function POST(request: Request) {
  return runExpireJob(request);
}
