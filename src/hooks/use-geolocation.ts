'use client';

import { useCallback, useState } from 'react';

interface GeolocationState {
  requesting: boolean;
  error: string | null;
}

/** Wraps the browser geolocation prompt and returns a `"lat,lon"` query string. */
export function useGeolocation(onLocated: (query: string) => void) {
  const [state, setState] = useState<GeolocationState>({
    requesting: false,
    error: null,
  });

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ requesting: false, error: 'This browser cannot share a location.' });
      return;
    }

    setState({ requesting: true, error: null });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setState({ requesting: false, error: null });
        onLocated(`${coords.latitude.toFixed(4)},${coords.longitude.toFixed(4)}`);
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied.'
            : 'Could not determine your location.';
        setState({ requesting: false, error: message });
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }, [onLocated]);

  return { ...state, locate } as const;
}
