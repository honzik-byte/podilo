import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/apiAuth';
import { geocodeAddress } from '@/lib/geocoding';
import { checkInMemoryRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);

  if (!auth) {
    return NextResponse.json({ error: 'Pro geokódování adresy musíte být přihlášeni.' }, { status: 401 });
  }

  const clientIp = getClientIp(request);
  if (!checkInMemoryRateLimit(`geocode:${clientIp}`, 10, 60 * 1000)) {
    return NextResponse.json({ error: 'Příliš mnoho požadavků, zkuste to prosím později.' }, { status: 429 });
  }

  const payload = (await request.json()) as { query?: string };
  const query = (payload.query || '').trim();

  if (!query) {
    return NextResponse.json({ error: 'Chybí adresa k vyhledání.' }, { status: 400 });
  }

  const location = await geocodeAddress(query);

  return NextResponse.json({ location });
}
