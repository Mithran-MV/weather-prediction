'use client';

import { TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card } from '@/components/ui/card';
import type { ForecastDay } from '@/lib/schemas';
import { UNIT_LABELS, type UnitSystem } from '@/lib/units';

interface TrendChartProps {
  history: ForecastDay[];
  forecast: ForecastDay[];
  units: UnitSystem;
  todayIso: string;
}

interface Point {
  date: string;
  label: string;
  high: number;
  low: number;
  /** Recharts renders an [low, high] tuple as a floating band. */
  range: [number, number];
  precip: number;
  isPast: boolean;
}

/**
 * Observed history and forecast on one continuous axis.
 *
 * Splitting them into two charts (the original design) hid the thing worth
 * seeing: whether the week ahead continues the trend or breaks it.
 */
export function TrendChart({ history, forecast, units, todayIso }: TrendChartProps) {
  const metric = units === 'metric';
  const unitLabel = UNIT_LABELS[units].temp;

  const data = useMemo<Point[]>(() => {
    const toPoint = (day: ForecastDay, isPast: boolean): Point => {
      const high = Math.round(metric ? day.day.maxtemp_c : day.day.maxtemp_f);
      const low = Math.round(metric ? day.day.mintemp_c : day.day.mintemp_f);
      return {
        date: day.date,
        label: new Date(`${day.date}T12:00:00`).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        high,
        low,
        range: [low, high],
        precip: Number(day.day.totalprecip_mm.toFixed(1)),
        isPast,
      };
    };

    const seen = new Set<string>();
    return [
      ...history.map((day) => toPoint(day, true)),
      ...forecast.map((day) => toPoint(day, false)),
    ].filter((point) =>
      seen.has(point.date) ? false : seen.add(point.date) !== undefined,
    );
  }, [history, forecast, metric]);

  if (data.length < 2) return null;

  const todayPoint = data.find((point) => point.date === todayIso);

  return (
    <Card
      title="Temperature trend"
      icon={<TrendingUp className="h-3.5 w-3.5" />}
      bodyClassName="px-2 pb-4"
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="range-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#3b66f6" stopOpacity={0.18} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-slate-500 dark:text-slate-400"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-slate-500 dark:text-slate-400"
              tickLine={false}
              axisLine={false}
              width={44}
              unit={unitLabel}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgb(148 163 184 / 0.3)',
                background: 'rgb(255 255 255 / 0.95)',
                fontSize: 12,
                color: '#0f172a',
              }}
              formatter={(value, name) =>
                name === 'Rainfall'
                  ? [`${value as number} mm`, name]
                  : [`${value as number}${unitLabel}`, name]
              }
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="plainline"
              iconSize={14}
            />

            {todayPoint && (
              <ReferenceLine
                x={todayPoint.label}
                stroke="#3b66f6"
                strokeDasharray="4 4"
                label={{
                  value: 'today',
                  position: 'insideTopRight',
                  fontSize: 10,
                  fill: '#3b66f6',
                }}
              />
            )}

            <Area
              dataKey="range"
              name="Daily range"
              stroke="none"
              fill="url(#range-fill)"
              isAnimationActive={false}
              legendType="none"
            />
            <Line
              dataKey="high"
              name="High"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 2.5 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            <Line
              dataKey="low"
              name="Low"
              stroke="#3b66f6"
              strokeWidth={2}
              dot={{ r: 2.5 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="px-3 text-xs text-slate-500 dark:text-slate-400">
        {history.length} days observed, {forecast.length} days forecast.
      </p>
    </Card>
  );
}
