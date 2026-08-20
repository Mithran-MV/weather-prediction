/** Join conditional class names, skipping falsy entries. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

/** "Mon", "Tue", … or "Today" for the current date in the location's zone. */
export function dayLabel(dateIso: string, timeZone: string, todayIso: string): string {
  if (dateIso === todayIso) return 'Today';
  return new Date(`${dateIso}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone,
  });
}

/** Local clock time for an epoch-seconds value, e.g. "14:00". */
export function hourLabel(epochSeconds: number, timeZone: string): string {
  return new Date(epochSeconds * 1000).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  });
}

/** "2 minutes ago", for the "last updated" line. */
export function relativeTime(iso: string, now = Date.now()): string {
  const seconds = Math.round((now - new Date(iso).getTime()) / 1000);
  if (seconds < 45) return 'just now';

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  // [seconds-per-unit, unit] — the first unit the elapsed time does not
  // overflow wins, so 3 hours formats as hours rather than 180 minutes.
  const units: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [1, 'second'],
    [60, 'minute'],
    [3600, 'hour'],
    [86_400, 'day'],
  ];

  let chosen: [number, Intl.RelativeTimeFormatUnit] = units[0]!;
  for (const unit of units) {
    if (seconds >= unit[0]) chosen = unit;
  }

  return formatter.format(-Math.round(seconds / chosen[0]), chosen[1]);
}

/** WeatherAPI ships protocol-relative icon URLs (`//cdn...`). */
export function iconUrl(icon: string): string {
  return icon.startsWith('//') ? `https:${icon}` : icon;
}
