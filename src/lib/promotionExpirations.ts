import 'server-only';

import { promises as fs } from 'fs';
import path from 'path';
import { createServerSupabaseAdmin } from '@/lib/serverSupabase';
import { getPromotionPlan, type PromotionPlanId } from '@/lib/promotionPlans';

interface PromotionExpirationRecord {
  listingId: string;
  planId: PromotionPlanId;
  stripeSessionId: string;
  activatedAt: string;
  expiresAt: string;
}

const promotionsPath = path.join(process.cwd(), 'src/data/promotionExpirations.json');

async function readPromotionExpirations() {
  const content = await fs.readFile(promotionsPath, 'utf8');
  return JSON.parse(content) as PromotionExpirationRecord[];
}

async function writePromotionExpirations(records: PromotionExpirationRecord[]) {
  await fs.writeFile(promotionsPath, JSON.stringify(records, null, 2), 'utf8');
}

export async function upsertPromotionExpiration(record: PromotionExpirationRecord) {
  const records = await readPromotionExpirations();
  const nextRecords = records.filter((item) => item.listingId !== record.listingId);
  nextRecords.push(record);
  await writePromotionExpirations(nextRecords);
}

export async function syncExpiredPromotions() {
  const records = await readPromotionExpirations();
  const now = Date.now();
  const expired = records.filter((record) => new Date(record.expiresAt).getTime() <= now);

  if (expired.length === 0) {
    return { expiredCount: 0 };
  }

  const adminClient = createServerSupabaseAdmin();

  for (const record of expired) {
    const plan = getPromotionPlan(record.planId);

    if (!plan) {
      continue;
    }

    const resetPayload: Record<string, boolean | string> = {
      updated_at: new Date().toISOString(),
    };

    if (plan.apply.is_top) {
      resetPayload.is_top = false;
    }

    if (plan.apply.is_highlighted) {
      resetPayload.is_highlighted = false;
    }

    await adminClient
      .from('listings')
      .update(resetPayload)
      .eq('id', record.listingId);
  }

  const activeRecords = records.filter((record) => new Date(record.expiresAt).getTime() > now);
  await writePromotionExpirations(activeRecords);

  return { expiredCount: expired.length };
}
