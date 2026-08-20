'use client';

import { Leaf } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { aqiBand } from '@/lib/aqi';
import type { CurrentWeather } from '@/lib/schemas';
import { cn } from '@/lib/utils';

/** WHO 24-hour guideline values, used as the "1.0×" reference for each bar. */
const POLLUTANTS = [
  { key: 'pm2_5', label: 'PM2.5', guideline: 15 },
  { key: 'pm10', label: 'PM10', guideline: 45 },
  { key: 'o3', label: 'O₃', guideline: 100 },
  { key: 'no2', label: 'NO₂', guideline: 25 },
] as const;

export function AirQualityCard({
  airQuality,
}: {
  airQuality: CurrentWeather['air_quality'];
}) {
  const band = aqiBand(airQuality?.['us-epa-index']);

  if (!airQuality || !band) {
    return (
      <Card title="Air quality" icon={<Leaf className="h-3.5 w-3.5" />}>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No air-quality readings are available for this location.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Air quality" icon={<Leaf className="h-3.5 w-3.5" />}>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums">{band.index}</span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
            band.className,
          )}
        >
          {band.label}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{band.advice}</p>

      <dl className="mt-4 space-y-2">
        {POLLUTANTS.map(({ key, label, guideline }) => {
          const value = airQuality[key];
          if (typeof value !== 'number') return null;
          const ratio = value / guideline;
          return (
            <div
              key={key}
              className="grid grid-cols-[3rem_1fr_4.5rem] items-center gap-2"
            >
              <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{
                    width: `${Math.min(ratio * 100, 100)}%`,
                    backgroundColor: band.color,
                  }}
                />
              </dd>
              <dd className="text-right text-xs text-slate-500 tabular-nums dark:text-slate-400">
                {value.toFixed(1)} µg/m³
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="mt-3 text-[11px] text-slate-400">
        Bars are scaled against WHO 24-hour guideline values.
      </p>
    </Card>
  );
}
