'use client';

import { Clock, Droplet } from 'lucide-react';
import Image from 'next/image';

import { Card } from '@/components/ui/card';
import type { ForecastDay } from '@/lib/schemas';
import { formatTemp, type UnitSystem } from '@/lib/units';
import { cn, hourLabel, iconUrl } from '@/lib/utils';

interface HourlyStripProps {
  days: ForecastDay[];
  timeZone: string;
  nowEpoch: number;
  units: UnitSystem;
}

/** Next 24 hours, rolling across the day boundary rather than stopping at midnight. */
export function HourlyStrip({ days, timeZone, nowEpoch, units }: HourlyStripProps) {
  const hours = days
    .flatMap((day) => day.hour)
    // Keep the hour currently in progress: its epoch is up to 59 minutes past.
    .filter((hour) => hour.time_epoch >= nowEpoch - 3600)
    .slice(0, 24);

  if (hours.length === 0) return null;

  return (
    <Card
      title="Next 24 hours"
      icon={<Clock className="h-3.5 w-3.5" />}
      bodyClassName="px-0 pb-4"
    >
      <ul
        className="flex snap-x snap-mandatory gap-1 overflow-x-auto px-4 pb-2"
        aria-label="Hourly forecast"
      >
        {hours.map((hour, index) => {
          const isNow = index === 0;
          return (
            <li
              key={hour.time_epoch}
              className={cn(
                'flex w-[68px] shrink-0 snap-start flex-col items-center gap-1 rounded-xl px-2 py-3 transition',
                isNow
                  ? 'bg-brand-50 dark:bg-slate-700/60'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800',
              )}
            >
              <span className="text-[11px] font-medium text-slate-500 tabular-nums dark:text-slate-400">
                {isNow ? 'Now' : hourLabel(hour.time_epoch, timeZone)}
              </span>
              <Image
                src={iconUrl(hour.condition.icon)}
                alt={hour.condition.text}
                width={36}
                height={36}
                className="h-9 w-9"
                unoptimized
              />
              <span className="text-sm font-semibold tabular-nums">
                {formatTemp(hour.temp_c, units, hour.temp_f)}
              </span>
              <span
                className={cn(
                  'flex items-center gap-0.5 text-[11px] tabular-nums',
                  hour.chance_of_rain >= 40
                    ? 'text-brand-600 dark:text-brand-300'
                    : 'text-transparent',
                )}
                aria-hidden={hour.chance_of_rain < 40}
              >
                <Droplet className="h-2.5 w-2.5" />
                {hour.chance_of_rain}%
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
