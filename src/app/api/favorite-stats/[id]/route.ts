import { NextResponse } from 'next/server';
import { getFavoriteCount, toggleFavoriteStat } from '@/lib/favoriteStats';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const count = await getFavoriteCount(resolvedParams.id);
  return NextResponse.json({ count });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const body = (await request.json()) as { visitorId?: string; action?: 'save' | 'unsave' };

  if (!body.visitorId || body.visitorId.length > 128 || !['save', 'unsave'].includes(body.action || '')) {
    return NextResponse.json({ error: 'Neplatná data.' }, { status: 400 });
  }

  const action = body.action as 'save' | 'unsave';
  const count = await toggleFavoriteStat(resolvedParams.id, body.visitorId, action);
  return NextResponse.json({ count });
}
