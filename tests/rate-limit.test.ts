import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clientKey, rateLimit } from '@/lib/rate-limit';

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  it('allows requests up to the limit and then rejects', () => {
    const key = `test-${Math.random()}`;
    for (let index = 0; index < 3; index += 1) {
      expect(rateLimit(key, 3, 1000).ok).toBe(true);
    }
    expect(rateLimit(key, 3, 1000).ok).toBe(false);
  });

  it('reports the remaining budget', () => {
    const key = `remaining-${Math.random()}`;
    expect(rateLimit(key, 5, 1000).remaining).toBe(4);
    expect(rateLimit(key, 5, 1000).remaining).toBe(3);
  });

  it('rolls the window over once it expires', () => {
    const key = `window-${Math.random()}`;
    rateLimit(key, 1, 1000);
    expect(rateLimit(key, 1, 1000).ok).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, 1, 1000).ok).toBe(true);
  });

  it('tracks keys independently', () => {
    const suffix = Math.random();
    rateLimit(`a-${suffix}`, 1, 1000);
    expect(rateLimit(`b-${suffix}`, 1, 1000).ok).toBe(true);
  });
});

describe('clientKey', () => {
  it('uses the first hop of x-forwarded-for', () => {
    const request = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '203.0.113.5, 70.41.3.18' },
    });
    expect(clientKey(request)).toBe('203.0.113.5');
  });

  it('falls back to x-real-ip and then to a constant', () => {
    expect(
      clientKey(new Request('https://example.com', { headers: { 'x-real-ip': '198.51.100.7' } })),
    ).toBe('198.51.100.7');
    expect(clientKey(new Request('https://example.com'))).toBe('anonymous');
  });
});
