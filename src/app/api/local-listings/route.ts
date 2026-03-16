import { NextResponse } from 'next/server';
import { getLocalListings } from '@/lib/localListings';

export async function GET() {
  const listings = await getLocalListings();
  return NextResponse.json(listings);
}
