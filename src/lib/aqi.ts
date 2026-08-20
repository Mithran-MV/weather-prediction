/**
 * US EPA air-quality bands.
 *
 * WeatherAPI returns `us-epa-index` as 1–6; the raw number means nothing to a
 * reader, so every band carries a label, a colour and the advice that actually
 * changes someone's behaviour.
 */
export interface AqiBand {
  index: number;
  label: string;
  advice: string;
  /** Tailwind classes for the badge. */
  className: string;
  /** Hex used for chart strokes, where Tailwind classes do not apply. */
  color: string;
}

const BANDS: readonly AqiBand[] = [
  {
    index: 1,
    label: 'Good',
    advice: 'Air quality is satisfactory. Outdoor activity carries no risk.',
    className:
      'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30',
    color: '#10b981',
  },
  {
    index: 2,
    label: 'Moderate',
    advice: 'Acceptable, though unusually sensitive people may want a shorter run.',
    className: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 ring-yellow-500/30',
    color: '#eab308',
  },
  {
    index: 3,
    label: 'Unhealthy for sensitive groups',
    advice:
      'Children, older adults and people with asthma should limit exertion outdoors.',
    className: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 ring-orange-500/30',
    color: '#f97316',
  },
  {
    index: 4,
    label: 'Unhealthy',
    advice: 'Everyone may feel effects. Move long or intense workouts indoors.',
    className: 'bg-red-500/15 text-red-700 dark:text-red-300 ring-red-500/30',
    color: '#ef4444',
  },
  {
    index: 5,
    label: 'Very unhealthy',
    advice: 'Health alert. Avoid outdoor exertion and keep windows closed.',
    className: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 ring-purple-500/30',
    color: '#a855f7',
  },
  {
    index: 6,
    label: 'Hazardous',
    advice: 'Emergency conditions. Stay indoors and use filtration if available.',
    className: 'bg-rose-800/20 text-rose-700 dark:text-rose-300 ring-rose-800/40',
    color: '#9f1239',
  },
] as const;

export function aqiBand(index: number | undefined | null): AqiBand | null {
  if (typeof index !== 'number') return null;
  return BANDS[Math.min(Math.max(Math.round(index), 1), 6) - 1] ?? null;
}

/** UV bands follow the WHO global solar UV index. */
export function uvBand(uv: number): { label: string; advice: string; className: string } {
  if (uv < 3)
    return {
      label: 'Low',
      advice: 'No protection needed.',
      className: 'text-emerald-600 dark:text-emerald-400',
    };
  if (uv < 6)
    return {
      label: 'Moderate',
      advice: 'Seek shade near midday.',
      className: 'text-yellow-600 dark:text-yellow-400',
    };
  if (uv < 8)
    return {
      label: 'High',
      advice: 'Sunscreen and a hat are worth it.',
      className: 'text-orange-600 dark:text-orange-400',
    };
  if (uv < 11)
    return {
      label: 'Very high',
      advice: 'Avoid the sun between 10am and 4pm.',
      className: 'text-red-600 dark:text-red-400',
    };
  return {
    label: 'Extreme',
    advice: 'Unprotected skin can burn in minutes.',
    className: 'text-purple-600 dark:text-purple-400',
  };
}
