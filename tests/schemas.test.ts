import { describe, expect, it } from 'vitest';

import { weatherQuerySchema } from '@/lib/schemas';

describe('weatherQuerySchema', () => {
  it('applies defaults for days and history', () => {
    const result = weatherQuerySchema.parse({ q: 'London' });
    expect(result).toEqual({ q: 'London', days: 7, history: 5 });
  });

  it('trims and rejects blank queries', () => {
    expect(weatherQuerySchema.safeParse({ q: '   ' }).success).toBe(false);
    expect(weatherQuerySchema.parse({ q: '  Paris ' }).q).toBe('Paris');
  });

  it('coerces numeric strings from the query string', () => {
    expect(weatherQuerySchema.parse({ q: 'Paris', days: '3' }).days).toBe(3);
  });

  it('rejects out-of-range values rather than clamping silently', () => {
    expect(weatherQuerySchema.safeParse({ q: 'Paris', days: 99 }).success).toBe(false);
    expect(weatherQuerySchema.safeParse({ q: 'Paris', history: -1 }).success).toBe(false);
  });

  it('caps absurdly long queries', () => {
    expect(weatherQuerySchema.safeParse({ q: 'x'.repeat(200) }).success).toBe(false);
  });
});
