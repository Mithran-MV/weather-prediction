import { describe, expect, it } from 'vitest';

import { skyClass, skyNeedsDarkText } from '@/lib/sky';

describe('skyClass', () => {
  it('distinguishes day and night for clear skies', () => {
    expect(skyClass(1000, true)).toBe('sky-clear-day');
    expect(skyClass(1000, false)).toBe('sky-clear-night');
  });

  it('groups cloud codes', () => {
    expect(skyClass(1003, true)).toBe('sky-cloud-day');
    expect(skyClass(1009, false)).toBe('sky-cloud-night');
  });

  it('gives precipitation its own gradients regardless of daylight', () => {
    expect(skyClass(1183, true)).toBe('sky-rain');
    expect(skyClass(1183, false)).toBe('sky-rain');
    expect(skyClass(1213, true)).toBe('sky-snow');
    expect(skyClass(1276, true)).toBe('sky-storm');
  });

  it('flags only the light snow gradient as needing dark text', () => {
    expect(skyNeedsDarkText(1213)).toBe(true);
    expect(skyNeedsDarkText(1000)).toBe(false);
  });
});
