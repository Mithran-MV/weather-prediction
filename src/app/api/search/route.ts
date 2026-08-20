import { NextResponse } from 'next/server';

import { clientKey, rateLimit } from '@/lib/rate-limit';
import { searchLocations, WeatherApiError } from '@/lib/weather-api';

/** GET /api/search?q=chen — typeahead suggestions for the search box. */
export async function GET(request: Request) {
  const limit = rateLimit(`search:${clientKey(request)}`, 120, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const query = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  // WeatherAPI needs at least three characters before it returns anything
  // useful, so short prefixes are answered locally instead of upstream.
  if (query.length < 3) return NextResponse.json([]);

  try {
    const results = await searchLocations(query.slice(0, 120));
    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    if (error instanceof WeatherApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[api/search] unexpected failure', error);
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
  }
}
