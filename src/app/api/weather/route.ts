import { NextResponse } from 'next/server';
import { z } from 'zod';

import { clientKey, rateLimit } from '@/lib/rate-limit';
import { weatherQuerySchema } from '@/lib/schemas';
import { getWeatherBundle, WeatherApiError } from '@/lib/weather-api';

/**
 * GET /api/weather?q=London&days=7&history=5
 *
 * The browser never sees the WeatherAPI key: it lives in this process only.
 * That is the whole reason this route exists rather than calling the provider
 * from a client component.
 */
export async function GET(request: Request) {
  const limit = rateLimit(`weather:${clientKey(request)}`, 60, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = weatherQuerySchema.safeParse({
    q: searchParams.get('q') ?? '',
    days: searchParams.get('days') ?? undefined,
    history: searchParams.get('history') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query.', issues: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }

  try {
    const bundle = await getWeatherBundle(parsed.data.q, {
      days: parsed.data.days,
      historyDays: parsed.data.history,
    });

    return NextResponse.json(bundle, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800',
        'X-RateLimit-Remaining': String(limit.remaining),
      },
    });
  } catch (error) {
    if (error instanceof WeatherApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[api/weather] unexpected failure', error);
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
  }
}
