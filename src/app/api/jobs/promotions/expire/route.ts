import { NextResponse } from 'next/server';
import { reportError } from '@/lib/errorReporting';
import { syncExpiredPromotions } from '@/lib/promotionExpirations';

export async function POST() {
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
