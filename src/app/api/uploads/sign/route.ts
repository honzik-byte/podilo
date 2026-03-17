import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const payload = (await request.json()) as { fileName?: string };
  const fileName = payload.fileName || 'image.jpg';
  const extension = fileName.split('.').pop() || 'jpg';
  const filePath = `${crypto.randomUUID()}.${extension}`;

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
