import 'server-only';

// Nominatim's usage policy requires a real identifying User-Agent and caps
// unattended use at 1 request/second. We serialize calls through this
// promise chain so concurrent listing submissions don't exceed that.
const NOMINATIM_MIN_INTERVAL_MS = 1100;
let queue: Promise<void> = Promise.resolve();

async function throttle() {
  const runAfter = queue;
  let release: () => void;
  queue = new Promise((resolve) => {
    release = resolve;
  });

  await runAfter;
  return () => setTimeout(release, NOMINATIM_MIN_INTERVAL_MS);
}

export async function geocodeAddress(query: string) {
  const trimmed = query.trim();

  if (!trimmed) {
    return null;
  }

  const release = await throttle();

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(trimmed)}`,
      {
        headers: {
          'User-Agent': 'Podilo/1.0 (+https://podilo.cz; podpora@podilo.cz)',
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const results = (await response.json()) as Array<{ lat: string; lon: string }>;

    if (results.length === 0) {
      return null;
    }

    return {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon),
    };
  } catch (error) {
    console.error('[Geocoding] Nominatim lookup failed', { query: trimmed, error });
    return null;
  } finally {
    release();
  }
}
