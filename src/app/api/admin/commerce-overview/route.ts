import { NextResponse } from 'next/server';
import { getAdminEngagementSnapshot } from '@/lib/listingEngagement';
import { getAdminPromotionSnapshot } from '@/lib/listingPromotions';
import { getPendingNotificationJobs } from '@/lib/notificationJobs';
import { getRecentAuditLogs } from '@/lib/auditLogs';
import { getRecentErrorReports } from '@/lib/errorReporting';
import { createServerSupabaseAdmin } from '@/lib/serverSupabase';

async function isAdminRequest(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return false;
  }

  const adminClient = createServerSupabaseAdmin();
  const {
    data: { user },
    error: userError,
  } = await adminClient.auth.getUser(token);

  if (userError || !user) {
    return false;
  }

  const { data: roleData } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  return roleData?.role === 'admin';
}

export async function GET(request: Request) {
  const allowed = await isAdminRequest(request);

  if (!allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [{ promotions, paymentEvents }, engagement, auditLogs, pendingNotifications, errorReports] = await Promise.all([
    getAdminPromotionSnapshot(),
    getAdminEngagementSnapshot(),
    getRecentAuditLogs(20),
    getPendingNotificationJobs(20),
    getRecentErrorReports(20),
  ]);

  return NextResponse.json({
    promotions,
    paymentEvents,
    engagement,
    auditLogs,
    pendingNotifications,
    errorReports,
  });
}
