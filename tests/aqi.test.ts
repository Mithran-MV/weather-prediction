import { describe, expect, it } from 'vitest';

import { aqiBand, uvBand } from '@/lib/aqi';

describe('aqiBand', () => {
  it('returns null when the provider omits an index', () => {
    expect(aqiBand(undefined)).toBeNull();
    expect(aqiBand(null)).toBeNull();
  });

  it('maps each EPA band to its label', () => {
    expect(aqiBand(1)?.label).toBe('Good');
    expect(aqiBand(2)?.label).toBe('Moderate');
    expect(aqiBand(4)?.label).toBe('Unhealthy');
    expect(aqiBand(6)?.label).toBe('Hazardous');
  });

  it('clamps values outside 1-6 instead of returning undefined', () => {
    expect(aqiBand(0)?.label).toBe('Good');
    expect(aqiBand(99)?.label).toBe('Hazardous');
  });

  it('rounds fractional indices', () => {
    expect(aqiBand(2.4)?.index).toBe(2);
    expect(aqiBand(2.6)?.index).toBe(3);
  });
});

describe('uvBand', () => {
  it('follows the WHO boundaries', () => {
    expect(uvBand(0).label).toBe('Low');
    expect(uvBand(2.9).label).toBe('Low');
    expect(uvBand(3).label).toBe('Moderate');
    expect(uvBand(6).label).toBe('High');
    expect(uvBand(8).label).toBe('Very high');
    expect(uvBand(11).label).toBe('Extreme');
  });
});
