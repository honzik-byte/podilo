import 'server-only';

import { createServerSupabaseAdmin } from '@/lib/serverSupabase';

interface ErrorReportInput {
  source: string;
  message: string;
  severity?: 'warning' | 'error' | 'critical';
  context?: Record<string, unknown>;
}

export async function reportError(input: ErrorReportInput) {
  try {
    const adminClient = createServerSupabaseAdmin();
    const { error } = await adminClient.from('error_reports').insert({
      source: input.source,
      message: input.message,
      severity: input.severity || 'error',
      context: input.context || {},
    });

    if (error) {
      console.error('[ErrorReport] Failed to persist error report', { input, error });
    }
  } catch (error) {
    console.error('[ErrorReport] Unexpected failure', { input, error });
  }
}

export async function getRecentErrorReports(limit = 25) {
  const adminClient = createServerSupabaseAdmin();
  const { data, error } = await adminClient
    .from('error_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[ErrorReport] Failed to load recent error reports', error);
    return [];
  }

  return data || [];
}
