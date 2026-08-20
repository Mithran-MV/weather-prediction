export type UnitSystem = 'metric' | 'imperial';

export const UNIT_LABELS: Record<
  UnitSystem,
  { temp: string; speed: string; distance: string }
> = {
  metric: { temp: '°C', speed: 'km/h', distance: 'km' },
  imperial: { temp: '°F', speed: 'mph', distance: 'mi' },
};

/** Pick the matching field from a WeatherAPI `*_c` / `*_f` pair. */
export function temp(
  source: { temp_c?: number; temp_f?: number } & Record<string, unknown>,
  units: UnitSystem,
  prefix = 'temp',
): number {
  const value = source[`${prefix}_${units === 'metric' ? 'c' : 'f'}`];
  return typeof value === 'number' ? value : 0;
}

export function formatTemp(
  celsius: number,
  units: UnitSystem,
  fahrenheit?: number,
): string {
  const value = units === 'metric' ? celsius : (fahrenheit ?? celsius * 1.8 + 32);
  return `${Math.round(value)}${UNIT_LABELS[units].temp}`;
}

export function formatSpeed(kph: number, units: UnitSystem): string {
  const value = units === 'metric' ? kph : kph * 0.621371;
  return `${Math.round(value)} ${UNIT_LABELS[units].speed}`;
}

export function formatDistance(km: number, units: UnitSystem): string {
  const value = units === 'metric' ? km : km * 0.621371;
  return `${Math.round(value)} ${UNIT_LABELS[units].distance}`;
}

/** Compass point for a bearing in degrees, e.g. 200 -> "SSW". */
export function windDirection(degrees: number): string {
  const points = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ] as const;
  const index = Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16;
  return points[index] ?? 'N';
}
