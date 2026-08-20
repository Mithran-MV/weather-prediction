import { describe, expect, it } from 'vitest';

import { formatDistance, formatSpeed, formatTemp, windDirection } from '@/lib/units';

describe('formatTemp', () => {
  it('rounds and labels celsius', () => {
    expect(formatTemp(21.4, 'metric')).toBe('21°C');
    expect(formatTemp(21.6, 'metric')).toBe('22°C');
  });

  it('prefers the provider fahrenheit value over converting', () => {
    expect(formatTemp(21, 'imperial', 69.8)).toBe('70°F');
  });

  it('falls back to conversion when fahrenheit is absent', () => {
    expect(formatTemp(0, 'imperial')).toBe('32°F');
    expect(formatTemp(100, 'imperial')).toBe('212°F');
  });
});

describe('formatSpeed', () => {
  it('keeps kph in metric and converts to mph in imperial', () => {
    expect(formatSpeed(20, 'metric')).toBe('20 km/h');
    expect(formatSpeed(100, 'imperial')).toBe('62 mph');
  });
});

describe('formatDistance', () => {
  it('converts kilometres to miles', () => {
    expect(formatDistance(10, 'metric')).toBe('10 km');
    expect(formatDistance(10, 'imperial')).toBe('6 mi');
  });
});

describe('windDirection', () => {
  it('maps cardinal bearings', () => {
    expect(windDirection(0)).toBe('N');
    expect(windDirection(90)).toBe('E');
    expect(windDirection(180)).toBe('S');
    expect(windDirection(270)).toBe('W');
  });

  it('rounds to the nearest 16-point sector', () => {
    expect(windDirection(22)).toBe('NNE');
    expect(windDirection(200)).toBe('SSW');
  });

  it('normalises out-of-range and negative bearings', () => {
    expect(windDirection(360)).toBe('N');
    expect(windDirection(450)).toBe('E');
    expect(windDirection(-90)).toBe('W');
  });
});
