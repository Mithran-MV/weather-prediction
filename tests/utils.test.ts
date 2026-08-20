import { describe, expect, it } from 'vitest';

import { cn, dayLabel, iconUrl, relativeTime } from '@/lib/utils';

describe('cn', () => {
  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });
});

describe('iconUrl', () => {
  it('upgrades protocol-relative provider URLs', () => {
    expect(iconUrl('//cdn.weatherapi.com/day/113.png')).toBe(
      'https://cdn.weatherapi.com/day/113.png',
    );
  });

  it('leaves absolute URLs untouched', () => {
    expect(iconUrl('https://example.com/a.png')).toBe('https://example.com/a.png');
  });
});

describe('dayLabel', () => {
  it('names the current date "Today"', () => {
    expect(dayLabel('2026-03-04', 'UTC', '2026-03-04')).toBe('Today');
  });

  it('uses a short weekday otherwise', () => {
    expect(dayLabel('2026-03-05', 'UTC', '2026-03-04')).toBe('Thu');
  });
});

describe('relativeTime', () => {
  const now = new Date('2026-03-04T12:00:00Z').getTime();

  it('collapses very recent timestamps', () => {
    expect(relativeTime('2026-03-04T11:59:40Z', now)).toBe('just now');
  });

  it('reports minutes and hours', () => {
    expect(relativeTime('2026-03-04T11:55:00Z', now)).toBe('5 minutes ago');
    expect(relativeTime('2026-03-04T09:00:00Z', now)).toBe('3 hours ago');
  });

  it('steps up to days rather than counting hours forever', () => {
    expect(relativeTime('2026-03-01T12:00:00Z', now)).toBe('3 days ago');
  });

  it('picks the largest unit that does not overflow', () => {
    expect(relativeTime('2026-03-04T11:59:00Z', now)).toBe('1 minute ago');
    expect(relativeTime('2026-03-04T10:59:00Z', now)).toBe('1 hour ago');
  });
});
