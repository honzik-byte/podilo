import { NextResponse } from 'next/server';
import { syncExpiredPromotions } from '@/lib/promotionExpirations';

export async function GET() {
  const result = await syncExpiredPromotions();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await syncExpiredPromotions();
  return NextResponse.json(result);
}
