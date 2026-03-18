import 'server-only';

import { createServerSupabaseAdmin } from '@/lib/serverSupabase';

interface NotificationJobInput {
  type: string;
  userId?: string | null;
  listingId?: string | null;
  recipientEmail: string;
  subject: string;
  payload?: Record<string, unknown>;
  sendAt?: string;
}

export async function enqueueNotificationJob(input: NotificationJobInput) {
  try {
    const adminClient = createServerSupabaseAdmin();
    const { error } = await adminClient.from('notification_jobs').insert({
      type: input.type,
      user_id: input.userId || null,
      listing_id: input.listingId || null,
      recipient_email: input.recipientEmail,
      subject: input.subject,
      payload: input.payload || {},
      send_at: input.sendAt || new Date().toISOString(),
    });

    if (error) {
      console.error('[NotificationJob] Failed to enqueue job', { input, error });
    }
  } catch (error) {
    console.error('[NotificationJob] Unexpected failure', { input, error });
  }
}

export async function getPendingNotificationJobs(limit = 20) {
  const adminClient = createServerSupabaseAdmin();
  const nowIso = new Date().toISOString();
  const { data, error } = await adminClient
    .from('notification_jobs')
    .select('*')
    .eq('status', 'pending')
    .lte('send_at', nowIso)
    .order('send_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('[NotificationJob] Failed to load pending jobs', error);
    return [];
  }

  return data || [];
}

export async function markNotificationSent(id: string) {
  const adminClient = createServerSupabaseAdmin();
  await adminClient
    .from('notification_jobs')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      attempts: 1,
      last_error: null,
    })
    .eq('id', id);
}

export async function markNotificationFailed(id: string, message: string) {
  const adminClient = createServerSupabaseAdmin();
  await adminClient
    .from('notification_jobs')
    .update({
      status: 'failed',
      attempts: 1,
      last_error: message,
    })
    .eq('id', id);
}
