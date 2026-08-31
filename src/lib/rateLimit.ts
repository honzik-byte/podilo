import 'server-only';

const hits = new Map<string, number[]>();

/**
 * Cheap in-process sliding-window limiter. Only protects a single warm
 * serverless instance, so it's a first line of defense on top of the
 * DB-backed check in leads.ts, not the sole guard.
 */
export function checkInMemoryRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const timestamps = (hits.get(key) || []).filter((time) => now - time < windowMs);

  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return true;
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip') || 'unknown';
}
