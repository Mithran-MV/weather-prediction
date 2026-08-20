'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * `useState` that persists to localStorage and stays in sync across tabs.
 *
 * Built on `useSyncExternalStore` rather than "read in an effect, then
 * setState": the server snapshot is `null`, so the first client render matches
 * the server HTML exactly and the stored value is adopted in the same commit
 * instead of triggering a second render pass.
 */

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();

function notify(key: string) {
  for (const listener of listeners.get(key) ?? []) listener();
}

function subscribeTo(key: string, listener: Listener): () => void {
  let bucket = listeners.get(key);
  if (!bucket) {
    bucket = new Set();
    listeners.set(key, bucket);
  }
  bucket.add(listener);

  // `storage` only fires in *other* tabs, so same-tab writes go through
  // notify(); both paths converge on the same subscriber set.
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) listener();
  };
  window.addEventListener('storage', onStorage);

  return () => {
    bucket.delete(listener);
    if (bucket.size === 0) listeners.delete(key);
    window.removeEventListener('storage', onStorage);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Storage disabled (Safari private mode, blocked third-party context).
    return null;
  }
}

export function useLocalStorage<T>(key: string, fallback: T) {
  const subscribe = useCallback(
    (listener: Listener) => subscribeTo(key, listener),
    [key],
  );
  const getSnapshot = useCallback(() => readRaw(key), [key]);
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const value = useMemo<T>(() => {
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }, [raw, fallback]);

  const setValue = useCallback(
    (next: T | ((current: T) => T)) => {
      const current = (() => {
        const stored = readRaw(key);
        if (stored === null) return fallback;
        try {
          return JSON.parse(stored) as T;
        } catch {
          return fallback;
        }
      })();

      const resolved =
        typeof next === 'function' ? (next as (current: T) => T)(current) : next;

      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Quota exceeded — the preference just will not survive a reload.
      }
      notify(key);
    },
    [key, fallback],
  );

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* nothing to clean up */
    }
    notify(key);
  }, [key]);

  return { value, setValue, hydrated: raw !== null, reset } as const;
}
