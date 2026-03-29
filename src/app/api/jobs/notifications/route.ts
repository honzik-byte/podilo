import { NextResponse } from 'next/server';
import { isAuthorizedCronRequest } from '@/lib/apiAuth';
import { sendEmail, renderPromotionEmail } from '@/lib/emailNotifications';
import { reportError } from '@/lib/errorReporting';
import { getPendingNotificationJobs, markNotificationFailed, markNotificationSent } from '@/lib/notificationJobs';

async function runNotificationJob(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobs = await getPendingNotificationJobs();
  let sent = 0;
  let failed = 0;

  for (const job of jobs as Array<{
    id: string;
    type: string;
    recipient_email: string;
    subject: string;
    payload: Record<string, unknown>;
  }>) {
    try {
      const html = renderPromotionEmail(job.type, job.payload || {});
      await sendEmail({
        to: job.recipient_email,
        subject: job.subject,
        html,
      });
      await markNotificationSent(job.id);
      sent += 1;
    } catch (error) {
      await reportError({
        source: 'notification_job',
        message: error instanceof Error ? error.message : 'Unknown notification failure',
        context: {
          jobId: job.id,
          type: job.type,
          recipientEmail: job.recipient_email,
        },
      });
      await markNotificationFailed(job.id, error instanceof Error ? error.message : 'Unknown notification failure');
      failed += 1;
    }
  }

  return NextResponse.json({ processed: jobs.length, sent, failed });
}

export async function GET(request: Request) {
  return runNotificationJob(request);
}

export async function POST(request: Request) {
  return runNotificationJob(request);
}
