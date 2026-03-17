import { NextResponse } from 'next/server';
import { getFavoriteCount, toggleFavoriteStat } from '@/lib/favoriteStats';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const count = await getFavoriteCount(resolvedParams.id);
  return NextResponse.json({ count });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const body = await request.json();
  const count = await toggleFavoriteStat(resolvedParams.id, body.visitorId, body.action);
  return NextResponse.json({ count });
}
