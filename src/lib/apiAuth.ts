import 'server-only';

import type { User } from '@supabase/supabase-js';
import { createServerSupabaseAdmin, createServerSupabaseAuth } from '@/lib/serverSupabase';

export function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  return authorization?.replace(/^Bearer\s+/i, '') || null;
}

export async function getAuthenticatedUser(request: Request): Promise<{ user: User; token: string } | null> {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  const authClient = createServerSupabaseAuth();
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return { user, token };
}

export async function isAdminUser(userId: string) {
  const adminClient = createServerSupabaseAdmin();
  const { data } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  return data?.role === 'admin';
}

export async function canAccessListingPrivateData(request: Request, listingId: string) {
  const auth = await getAuthenticatedUser(request);

  if (!auth) {
    return { allowed: false, user: null as User | null };
  }

  if (await isAdminUser(auth.user.id)) {
    return { allowed: true, user: auth.user };
  }

  const adminClient = createServerSupabaseAdmin();
  const { data: listing } = await adminClient
    .from('listings')
    .select('user_id')
    .eq('id', listingId)
    .maybeSingle();

  return {
    allowed: Boolean(listing?.user_id && listing.user_id === auth.user.id),
    user: auth.user,
  };
}

export async function requireAdminRequest(request: Request) {
  const auth = await getAuthenticatedUser(request);

  if (!auth) {
    return { allowed: false, user: null as User | null };
  }

  return {
    allowed: await isAdminUser(auth.user.id),
    user: auth.user,
  };
}

export function isAuthorizedCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  const token = getBearerToken(request);
  return token === secret;
}
