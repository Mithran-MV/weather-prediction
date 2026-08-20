'use client';

import { CalendarDays, Droplet } from 'lucide-react';
import Image from 'next/image';

import { Card } from '@/components/ui/card';
import type { ForecastDay } from '@/lib/schemas';
import { formatTemp, type UnitSystem } from '@/lib/units';
import { cn, dayLabel, iconUrl } from '@/lib/utils';

interface DailyForecastProps {
  days: ForecastDay[];
  timeZone: string;
  todayIso: string;
  units: UnitSystem;
}

export function DailyForecast({ days, timeZone, todayIso, units }: DailyForecastProps) {
  if (days.length === 0) return null;

  // A shared scale lets every row's bar be read against the others, which is
  // the whole point of stacking them — per-row scaling would be meaningless.
  const lows = days.map((day) => day.day.mintemp_c);
  const highs = days.map((day) => day.day.maxtemp_c);
  const floor = Math.min(...lows);
  const ceiling = Math.max(...highs);
  const span = Math.max(ceiling - floor, 1);

  return (
    <Card
      title={`${days.length}-day forecast`}
      icon={<CalendarDays className="h-3.5 w-3.5" />}
    >
      <ul className="divide-y divide-slate-200/70 dark:divide-slate-700/60">
        {days.map((day) => {
          const offset = ((day.day.mintemp_c - floor) / span) * 100;
          const width = ((day.day.maxtemp_c - day.day.mintemp_c) / span) * 100;
          const rain = day.day.daily_chance_of_rain ?? 0;

          return (
            <li
              key={day.date}
              className="grid grid-cols-[3.25rem_2.25rem_1fr_auto] items-center gap-3 py-2.5"
            >
              <span className="text-sm font-medium">
                {dayLabel(day.date, timeZone, todayIso)}
              </span>

              <span className="relative flex items-center">
                <Image
                  src={iconUrl(day.day.condition.icon)}
                  alt={day.day.condition.text}
                  width={32}
                  height={32}
                  className="h-8 w-8"
                  unoptimized
                />
                {rain >= 40 && (
                  <span className="text-brand-600 dark:text-brand-300 absolute -right-1 -bottom-0.5 flex items-center text-[10px] font-semibold tabular-nums">
                    <Droplet className="h-2.5 w-2.5" aria-hidden="true" />
                    {rain}
                  </span>
                )}
              </span>

              <span className="flex items-center gap-2">
                <span className="w-9 text-right text-xs text-slate-500 tabular-nums dark:text-slate-400">
                  {formatTemp(day.day.mintemp_c, units, day.day.mintemp_f)}
                </span>
                <span className="relative h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700">
                  <span
                    className="absolute inset-y-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-orange-500"
                    style={{ left: `${offset}%`, width: `${Math.max(width, 6)}%` }}
                  />
                </span>
              </span>

              <span className={cn('w-9 text-right text-xs font-semibold tabular-nums')}>
                {formatTemp(day.day.maxtemp_c, units, day.day.maxtemp_f)}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
