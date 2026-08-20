'use client';

import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/**
 * `false` during SSR and the hydrating render, `true` afterwards.
 *
 * The usual `useState(false)` + `useEffect(() => setMounted(true))` pair does
 * the same job with an extra render pass; this reads the value straight from
 * the two snapshot functions React already distinguishes.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
