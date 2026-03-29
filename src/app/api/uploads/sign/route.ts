import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { canAccessListingPrivateData, getAuthenticatedUser } from '@/lib/apiAuth';
import { isDatabaseListingId } from '@/lib/listingIds';

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);

  if (!auth) {
    return NextResponse.json({ error: 'Pro nahrání fotek je potřeba být přihlášen.' }, { status: 401 });
  }

  const payload = (await request.json()) as { fileName?: string; listingId?: string };

  if (payload.listingId && isDatabaseListingId(payload.listingId)) {
    const access = await canAccessListingPrivateData(request, payload.listingId);

    if (!access.allowed) {
      return NextResponse.json({ error: 'K tomuto inzerátu nemáte oprávnění nahrávat fotky.' }, { status: 403 });
    }
  }

  const fileName = payload.fileName || 'image.jpg';
  const extension = (fileName.split('.').pop() || 'jpg').toLowerCase();
  const safeExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg';
  const filePath = `${auth.user.id}/${crypto.randomUUID()}.${safeExtension}`;

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (!('createSignedUploadUrl' in client.storage.from('listing_images'))) {
    return NextResponse.json({ path: filePath, token: null });
  }

  const { data, error } = await client.storage.from('listing_images').createSignedUploadUrl(filePath);

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Upload token se nepodařilo vytvořit.' }, { status: 500 });
  }

  return NextResponse.json({
    path: filePath,
    token: data.token,
  });
}
