'use client';

import {
  Droplets,
  Eye,
  Gauge,
  RefreshCw,
  Star,
  Sunrise,
  Sunset,
  Wind,
} from 'lucide-react';
import Image from 'next/image';

import type { CurrentWeather, ForecastDay, WeatherLocation } from '@/lib/schemas';
import { skyClass, skyNeedsDarkText } from '@/lib/sky';
import {
  formatDistance,
  formatSpeed,
  formatTemp,
  windDirection,
  type UnitSystem,
} from '@/lib/units';
import { cn, iconUrl, relativeTime } from '@/lib/utils';

interface CurrentConditionsProps {
  location: WeatherLocation;
  current: CurrentWeather;
  today: ForecastDay | undefined;
  units: UnitSystem;
  fetchedAt: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRefresh: () => void;
}

export function CurrentConditions({
  location,
  current,
  today,
  units,
  fetchedAt,
  isFavorite,
  onToggleFavorite,
  onRefresh,
}: CurrentConditionsProps) {
  const isDay = current.is_day === 1;
  const dark = skyNeedsDarkText(current.condition.code);
  const ink = dark ? 'text-slate-900' : 'text-white';
  const inkMuted = dark ? 'text-slate-700' : 'text-white/75';

  const stats = [
    {
      Icon: Droplets,
      label: 'Humidity',
      value: `${current.humidity}%`,
    },
    {
      Icon: Wind,
      label: 'Wind',
      value: `${formatSpeed(current.wind_kph, units)} ${windDirection(current.wind_degree)}`,
    },
    {
      Icon: Gauge,
      label: 'Pressure',
      value: `${Math.round(current.pressure_mb)} mb`,
    },
    {
      Icon: Eye,
      label: 'Visibility',
      value: formatDistance(current.vis_km, units),
    },
  ] as const;

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 shadow-lg sm:p-8',
        skyClass(current.condition.code, isDay),
        ink,
      )}
    >
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {location.name}
          </h1>
          <p className={cn('mt-0.5 text-sm', inkMuted)}>
            {[location.region, location.country].filter(Boolean).join(', ')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Remove from saved places' : 'Save this place'}
            className={cn(
              'rounded-full border border-current/25 p-2 transition',
              dark ? 'hover:bg-slate-900/10' : 'hover:bg-white/20',
            )}
          >
            <Star className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </button>
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh weather data"
            className={cn(
              'rounded-full border border-current/25 p-2 transition',
              dark ? 'hover:bg-slate-900/10' : 'hover:bg-white/20',
            )}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="flex items-center gap-3">
          <Image
            src={iconUrl(current.condition.icon)}
            alt=""
            width={80}
            height={80}
            className="h-20 w-20 drop-shadow-lg"
            unoptimized
            priority
          />
          <div>
            <p className="text-6xl leading-none font-light tabular-nums sm:text-7xl">
              {formatTemp(current.temp_c, units, current.temp_f)}
            </p>
            <p className={cn('mt-2 text-sm', inkMuted)}>
              Feels like {formatTemp(current.feelslike_c, units, current.feelslike_f)}
            </p>
          </div>
        </div>

        <div className="min-w-40">
          <p className="text-lg font-medium">{current.condition.text}</p>
          {today && (
            <p className={cn('mt-1 text-sm tabular-nums', inkMuted)}>
              H {formatTemp(today.day.maxtemp_c, units, today.day.maxtemp_f)} · L{' '}
              {formatTemp(today.day.mintemp_c, units, today.day.mintemp_f)}
            </p>
          )}
          {today && (
            <p className={cn('mt-1 flex items-center gap-3 text-xs', inkMuted)}>
              <span className="flex items-center gap-1">
                <Sunrise className="h-3.5 w-3.5" aria-hidden="true" />
                {today.astro.sunrise}
              </span>
              <span className="flex items-center gap-1">
                <Sunset className="h-3.5 w-3.5" aria-hidden="true" />
                {today.astro.sunset}
              </span>
            </p>
          )}
        </div>
      </div>

      <dl className="relative mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-current/15 pt-5 sm:grid-cols-4">
        {stats.map(({ Icon, label, value }) => (
          <div key={label}>
            <dt className={cn('flex items-center gap-1.5 text-xs', inkMuted)}>
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </dt>
            <dd className="mt-1 text-sm font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <p className={cn('relative mt-5 text-xs', inkMuted)}>
        Local time {location.localtime.split(' ')[1]} · updated {relativeTime(fetchedAt)}
      </p>
    </section>
  );
}
