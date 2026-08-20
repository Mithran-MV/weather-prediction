import 'server-only';

import {
  forecastResponseSchema,
  historyResponseSchema,
  searchResponseSchema,
  type ForecastDay,
  type SearchResult,
  type WeatherBundle,
} from './schemas';

const BASE_URL = process.env.WEATHER_API_BASE_URL ?? 'https://api.weatherapi.com/v1';

/** Thrown for any upstream failure; carries an HTTP status the route can reuse. */
export class WeatherApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'WeatherApiError';
  }
}

function requireApiKey(): string {
  const key = process.env.WEATHER_API_KEY;
  if (!key) {
    throw new WeatherApiError(
      'WEATHER_API_KEY is not configured. Copy .env.example to .env.local and add your key.',
      500,
    );
  }
  return key;
}

/**
 * Fetch a WeatherAPI endpoint.
 *
 * `revalidate` leans on Next's data cache so a burst of visitors costs one
 * upstream call rather than one per visitor — the free tier is 1M calls/month
 * and repeated identical lookups are the easiest way to burn through it.
 */
async function request(
  endpoint: string,
  params: Record<string, string>,
  revalidate: number,
): Promise<unknown> {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set('key', requireApiKey());
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      next: { revalidate },
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (cause) {
    const timedOut = cause instanceof Error && cause.name === 'TimeoutError';
    throw new WeatherApiError(
      timedOut
        ? 'The weather service timed out.'
        : 'Could not reach the weather service.',
      504,
    );
  }

  if (!response.ok) {
    // WeatherAPI reports failures as {"error":{"code":1006,"message":"..."}}.
    const detail = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    const message =
      detail?.error?.message ?? `Weather service returned ${response.status}.`;
    // Never let an upstream 401/403 (a bad key) reach the browser as-is: that
    // tells a probing client the key is the thing to attack.
    const status =
      response.status === 401 || response.status === 403 ? 500 : response.status;
    throw new WeatherApiError(
      status === 500 ? 'The weather service rejected this request.' : message,
      status,
    );
  }

  return response.json();
}

/** Local YYYY-MM-DD for `date` shifted by `offsetDays`. */
function isoDate(date: Date, offsetDays = 0): string {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + offsetDays);
  return shifted.toISOString().slice(0, 10);
}

/**
 * Everything the dashboard renders for one place, in a single call.
 *
 * History is fetched day-by-day because WeatherAPI's `end_dt` range parameter
 * is a paid-plan feature — the original version of this app silently returned
 * only one day on the free tier.
 */
export async function getWeatherBundle(
  query: string,
  { days = 7, historyDays = 5 }: { days?: number; historyDays?: number } = {},
): Promise<WeatherBundle> {
  const forecastRaw = await request(
    'forecast.json',
    { q: query, days: String(days), aqi: 'yes', alerts: 'yes' },
    600,
  );

  const forecast = forecastResponseSchema.parse(forecastRaw);
  const localNow = new Date(forecast.location.localtime_epoch * 1000);

  const history = await getHistory(query, localNow, historyDays);

  return {
    location: forecast.location,
    current: forecast.current,
    forecast: forecast.forecast.forecastday,
    history,
    alerts: forecast.alerts?.alert ?? [],
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Past `count` days, newest last. Individual days are allowed to fail — a
 * missing archive day should dim one bar of a chart, not blank the dashboard.
 */
async function getHistory(
  query: string,
  localNow: Date,
  count: number,
): Promise<ForecastDay[]> {
  if (count <= 0) return [];

  const days = await Promise.all(
    Array.from({ length: count }, (_, index) => {
      const date = isoDate(localNow, -(count - index));
      return request('history.json', { q: query, dt: date }, 86_400)
        .then((raw) => historyResponseSchema.parse(raw).forecast.forecastday[0] ?? null)
        .catch(() => null);
    }),
  );

  return days.filter((day): day is ForecastDay => day !== null);
}

/** Typeahead lookup for the search box. */
export async function searchLocations(query: string): Promise<SearchResult[]> {
  const raw = await request('search.json', { q: query }, 86_400);
  return searchResponseSchema.parse(raw);
}
