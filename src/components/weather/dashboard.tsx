'use client';

import { AlertCircle, CloudSun, Map as MapIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useMemo } from 'react';

import { Card } from '@/components/ui/card';
import { DashboardSkeleton, Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AirQualityCard } from '@/components/weather/air-quality-card';
import { AlertsCard } from '@/components/weather/alerts-card';
import { CurrentConditions } from '@/components/weather/current-conditions';
import { DailyForecast } from '@/components/weather/daily-forecast';
import { FavoritesBar, type SavedPlace } from '@/components/weather/favorites-bar';
import { HourlyStrip } from '@/components/weather/hourly-strip';
import { LocationSearch } from '@/components/weather/location-search';
import { SunCard } from '@/components/weather/sun-card';
import { TrendChart } from '@/components/weather/trend-chart';
import { UnitToggle } from '@/components/weather/unit-toggle';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useWeather } from '@/hooks/use-weather';
import type { UnitSystem } from '@/lib/units';

// Leaflet touches `window` at import time, so it can only load in the browser.
const LocationMap = dynamic(() => import('@/components/weather/location-map'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

interface DashboardProps {
  defaultQuery: string;
  defaultLabel: string;
}

export function Dashboard({ defaultQuery, defaultLabel }: DashboardProps) {
  const active = useLocalStorage<SavedPlace>('wx.active', {
    query: defaultQuery,
    label: defaultLabel,
  });
  const favorites = useLocalStorage<SavedPlace[]>('wx.favorites', []);
  const units = useLocalStorage<UnitSystem>('wx.units', 'metric');

  const { data, error, loading, refresh } = useWeather(active.value.query);

  const selectPlace = useCallback(
    (query: string, label: string) => active.setValue({ query, label }),
    [active],
  );

  const isFavorite = useMemo(
    () => favorites.value.some((place) => place.query === active.value.query),
    [favorites.value, active.value.query],
  );

  const toggleFavorite = useCallback(() => {
    const label = data
      ? [data.location.name, data.location.country].filter(Boolean).join(', ')
      : active.value.label;
    favorites.setValue((current) =>
      current.some((place) => place.query === active.value.query)
        ? current.filter((place) => place.query !== active.value.query)
        : [...current, { query: active.value.query, label }].slice(0, 8),
    );
  }, [data, favorites, active.value]);

  // WeatherAPI reports `localtime` as "YYYY-MM-DD HH:mm" in the place's own
  // zone, which is what "today" has to mean here — not the viewer's midnight.
  const todayIso = data?.location.localtime.split(' ')[0] ?? '';

  return (
    <div className="min-h-dvh">
      <header className="sky-clear-night px-4 pt-5 pb-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-white">
              <CloudSun className="h-6 w-6" aria-hidden="true" />
              <span className="text-base font-semibold tracking-tight">
                Weather Prediction
              </span>
            </div>
            <div className="flex items-center gap-2">
              <UnitToggle units={units.value} onChange={units.setValue} />
              <ThemeToggle />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <LocationSearch onSelect={selectPlace} />
            <FavoritesBar
              places={favorites.value}
              activeQuery={active.value.query}
              onSelect={(place) => active.setValue(place)}
              onRemove={(query) =>
                favorites.setValue((current) =>
                  current.filter((place) => place.query !== query),
                )
              }
            />
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-16 max-w-6xl px-4 pb-16 sm:px-6">
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-400/40 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">{error}</p>
              <button
                type="button"
                onClick={refresh}
                className="mt-1 text-xs underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {loading && !data && <DashboardSkeleton />}

        {data && (
          <div className="space-y-6">
            <CurrentConditions
              location={data.location}
              current={data.current}
              today={data.forecast[0]}
              units={units.value}
              fetchedAt={data.fetchedAt}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onRefresh={refresh}
            />

            <HourlyStrip
              days={data.forecast}
              timeZone={data.location.tz_id}
              nowEpoch={data.current.last_updated_epoch}
              units={units.value}
            />

            <div className="grid gap-6 lg:grid-cols-3">
              <DailyForecast
                days={data.forecast}
                timeZone={data.location.tz_id}
                todayIso={todayIso}
                units={units.value}
              />
              <AirQualityCard airQuality={data.current.air_quality} />
              <SunCard
                today={data.forecast[0]}
                current={data.current}
                localTime={data.location.localtime}
              />
            </div>

            <TrendChart
              history={data.history}
              forecast={data.forecast}
              units={units.value}
              todayIso={todayIso}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <AlertsCard alerts={data.alerts} />
              <Card
                title="Location"
                icon={<MapIcon className="h-3.5 w-3.5" />}
                bodyClassName="px-0 pt-0 pb-0"
              >
                <div className="h-72 w-full overflow-hidden">
                  <LocationMap location={data.location} />
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200/70 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <p>
          Data from{' '}
          <a
            href="https://www.weatherapi.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-2"
          >
            WeatherAPI.com
          </a>{' '}
          · Map tiles &copy; OpenStreetMap contributors
        </p>
        <p className="mt-1">
          Built by{' '}
          <a
            href="https://github.com/Mithran-MV"
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-2"
          >
            Mithran MV
          </a>
        </p>
      </footer>
    </div>
  );
}
