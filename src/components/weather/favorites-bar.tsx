'use client';

import { Star, X } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface SavedPlace {
  query: string;
  label: string;
}

interface FavoritesBarProps {
  places: SavedPlace[];
  activeQuery: string;
  onSelect: (place: SavedPlace) => void;
  onRemove: (query: string) => void;
}

export function FavoritesBar({
  places,
  activeQuery,
  onSelect,
  onRemove,
}: FavoritesBarProps) {
  if (places.length === 0) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-white/60">
        <Star className="h-3 w-3" aria-hidden="true" />
        Star a place to pin it here.
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap items-center gap-1.5" aria-label="Saved places">
      {places.map((place) => {
        const active = place.query === activeQuery;
        return (
          <li key={place.query}>
            <span
              className={cn(
                'group flex items-center rounded-full border text-xs transition',
                active
                  ? 'border-white/70 bg-white text-slate-900'
                  : 'border-white/25 bg-white/10 text-white hover:bg-white/20',
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(place)}
                aria-current={active ? 'true' : undefined}
                className="max-w-40 truncate py-1.5 pr-1 pl-3"
              >
                {place.label}
              </button>
              <button
                type="button"
                onClick={() => onRemove(place.query)}
                aria-label={`Remove ${place.label} from saved places`}
                className={cn(
                  'rounded-full py-1.5 pr-2.5 pl-1 opacity-60 transition hover:opacity-100',
                )}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
