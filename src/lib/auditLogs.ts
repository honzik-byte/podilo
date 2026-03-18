import 'server-only';

import { createServerSupabaseAdmin } from '@/lib/serverSupabase';

interface AuditLogInput {
  actorUserId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  payload?: Record<string, unknown>;
}

export async function createAuditLog(input: AuditLogInput) {
  try {
    const adminClient = createServerSupabaseAdmin();
    const { error } = await adminClient.from('audit_logs').insert({
      actor_user_id: input.actorUserId || null,
      entity_type: input.entityType,
      entity_id: input.entityId,
      action: input.action,
      payload: input.payload || {},
    });

    if (error) {
      console.error('[AuditLog] Failed to persist audit log', {
        input,
        error,
      });
    }
  } catch (error) {
    console.error('[AuditLog] Unexpected failure', { input, error });
  }
}

export async function getRecentAuditLogs(limit = 25) {
  const adminClient = createServerSupabaseAdmin();
  const { data, error } = await adminClient
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[AuditLog] Failed to load recent logs', error);
    return [];
  }

  return data || [];
}
