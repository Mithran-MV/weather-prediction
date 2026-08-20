'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { WeatherBundle } from '@/lib/schemas';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

interface State {
  data: WeatherBundle | null;
  error: string | null;
  loading: boolean;
}

/**
 * Loads `/api/weather` for a place and keeps it warm.
 *
 * Refreshes are skipped while the tab is hidden — a backgrounded dashboard
 * polling every ten minutes is pure waste of a metered quota — and one is run
 * immediately when the tab becomes visible again so the reader never looks at
 * a stale number.
 */
export function useWeather(query: string) {
  const [state, setState] = useState<State>({ data: null, error: null, loading: true });
  const inFlight = useRef<AbortController | null>(null);

  const load = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!query) return;
      inFlight.current?.abort();
      const controller = new AbortController();
      inFlight.current = controller;

      setState((previous) => ({ ...previous, loading: !options.silent, error: null }));

      try {
        const response = await fetch(`/api/weather?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const payload: unknown = await response.json();

        if (!response.ok) {
          const message =
            typeof payload === 'object' && payload !== null && 'error' in payload
              ? String((payload as { error: unknown }).error)
              : 'Could not load weather for that location.';
          throw new Error(message);
        }

        setState({ data: payload as WeatherBundle, error: null, loading: false });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState((previous) => ({
          // Keep the last good payload on screen behind the error banner.
          data: previous.data,
          error: error instanceof Error ? error.message : 'Something went wrong.',
          loading: false,
        }));
      }
    },
    [query],
  );

  useEffect(() => {
    void load();
    return () => inFlight.current?.abort();
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load({ silent: true });
    }, REFRESH_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') void load({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  return { ...state, refresh: () => load({ silent: true }) } as const;
}
