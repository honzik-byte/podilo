import 'server-only';

import { createAuditLog } from '@/lib/auditLogs';
import { createServerSupabaseAdmin } from '@/lib/serverSupabase';

export async function syncExpiredPromotions() {
  const adminClient = createServerSupabaseAdmin();
  const nowIso = new Date().toISOString();

  const { data: listings, error } = await adminClient
    .from('listings')
    .select('id, is_top, is_highlighted, top_until, highlighted_until')
    .or(`top_until.lte.${nowIso},highlighted_until.lte.${nowIso}`);

  if (error) {
    console.error('[StripePromotion] Failed to query expired promotions', {
      nowIso,
      error,
    });
    return { expiredCount: 0, error: error.message };
  }

  if (!listings || listings.length === 0) {
    return { expiredCount: 0 };
  }

  let expiredCount = 0;

  for (const listing of listings as Array<{
    id: string;
    is_top?: boolean | null;
    is_highlighted?: boolean | null;
    top_until?: string | null;
    highlighted_until?: string | null;
  }>) {
    const resetPayload: Record<string, boolean | null> = {};

    if (listing.top_until && new Date(listing.top_until).getTime() <= Date.now()) {
      resetPayload.is_top = false;
      resetPayload.top_until = null;
    }

    if (listing.highlighted_until && new Date(listing.highlighted_until).getTime() <= Date.now()) {
      resetPayload.is_highlighted = false;
      resetPayload.highlighted_until = null;
    }

    if (Object.keys(resetPayload).length === 0) {
      continue;
    }

    const { error: updateError } = await adminClient
      .from('listings')
      .update(resetPayload)
      .eq('id', listing.id);

    if (updateError) {
      console.error('[StripePromotion] Promotion expiry reset failed', {
        listingId: listing.id,
        resetPayload,
        error: updateError,
      });
      continue;
    }

    expiredCount += 1;

    if (resetPayload.is_top === false || resetPayload.is_highlighted === false) {
      await adminClient
        .from('listing_promotions')
        .update({
          status: 'expired',
        })
        .eq('listing_id', listing.id)
        .eq('status', 'active')
        .lte('ends_at', nowIso);

      await createAuditLog({
        entityType: 'listing',
        entityId: listing.id,
        action: 'promotion_expired',
        payload: {
          resetPayload,
          nowIso,
        },
      });
    }

    console.info('[StripePromotion] Promotion expired and reset', {
      listingId: listing.id,
      resetPayload,
    });
  }

  return { expiredCount };
}
