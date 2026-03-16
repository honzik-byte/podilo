import { NextResponse } from 'next/server';
import { deleteLocalListing, getLocalListingById, getLocalListingRecordById, upsertLocalListing } from '@/lib/localListings';
import { parseListing } from '@/lib/listingMetadata';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const listing = await getLocalListingById(resolvedParams.id);

  if (!listing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(listing);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const existing = await getLocalListingRecordById(resolvedParams.id);

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const payload = await request.json();
  const parsed = parseListing(payload);

  await upsertLocalListing({
    ...existing,
    ...payload,
    id: resolvedParams.id,
    descriptionText: parsed.description,
    details: parsed.details,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  await deleteLocalListing(resolvedParams.id);
  return NextResponse.json({ ok: true });
}
