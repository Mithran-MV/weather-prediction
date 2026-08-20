'use client';

import { Sun } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { uvBand } from '@/lib/aqi';
import type { CurrentWeather, ForecastDay } from '@/lib/schemas';
import { cn } from '@/lib/utils';

/** Parse WeatherAPI's "06:14 AM" into minutes past midnight. */
function toMinutes(clock: string): number | null {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(clock.trim());
  if (!match) return null;
  const [, rawHour, rawMinute, meridiem] = match;
  let hour = Number(rawHour);
  if (meridiem?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (meridiem?.toUpperCase() === 'AM' && hour === 12) hour = 0;
  return hour * 60 + Number(rawMinute);
}

interface SunCardProps {
  today: ForecastDay | undefined;
  current: CurrentWeather;
  localTime: string;
}

export function SunCard({ today, current, localTime }: SunCardProps) {
  const uv = uvBand(current.uv);
  const sunrise = today ? toMinutes(today.astro.sunrise) : null;
  const sunset = today ? toMinutes(today.astro.sunset) : null;
  const nowClock = localTime.split(' ')[1] ?? '';
  const [nowHour = '0', nowMinute = '0'] = nowClock.split(':');
  const now = Number(nowHour) * 60 + Number(nowMinute);

  const progress =
    sunrise !== null && sunset !== null && sunset > sunrise
      ? Math.min(Math.max((now - sunrise) / (sunset - sunrise), 0), 1)
      : null;

  return (
    <Card title="Sun & UV" icon={<Sun className="h-3.5 w-3.5" />}>
      {progress !== null && today && (
        <>
          <div className="relative h-16" aria-hidden="true">
            <svg viewBox="0 0 200 70" className="h-full w-full overflow-visible">
              <path
                d="M10 62 A 90 90 0 0 1 190 62"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="3 4"
                className="text-slate-300 dark:text-slate-600"
              />
              {/* Position the marker along the same arc the path traces. */}
              <circle
                cx={100 - 90 * Math.cos(Math.PI * progress)}
                cy={62 - 90 * Math.sin(Math.PI * progress)}
                r="6"
                className="fill-amber-400"
              />
            </svg>
          </div>
          <div className="mt-1 flex justify-between text-xs text-slate-500 tabular-nums dark:text-slate-400">
            <span>{today.astro.sunrise}</span>
            <span>{today.astro.sunset}</span>
          </div>
        </>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200/70 pt-3 text-sm dark:border-slate-700/60">
        <div>
          <dt className="text-xs text-slate-500 dark:text-slate-400">UV index</dt>
          <dd className={cn('font-semibold tabular-nums', uv.className)}>
            {current.uv.toFixed(1)} · {uv.label}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500 dark:text-slate-400">Moon</dt>
          <dd className="font-medium">{today?.astro.moon_phase ?? '—'}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{uv.advice}</p>
    </Card>
  );
}
