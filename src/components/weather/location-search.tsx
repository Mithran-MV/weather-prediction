'use client';

import { Loader2, LocateFixed, MapPin, Search, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { useGeolocation } from '@/hooks/use-geolocation';
import type { SearchResult } from '@/lib/schemas';
import { cn } from '@/lib/utils';

interface LocationSearchProps {
  onSelect: (query: string, label: string) => void;
}

/**
 * Debounced typeahead over `/api/search`, with full keyboard support.
 *
 * The list is a WAI-ARIA combobox rather than a plain input so that arrow keys,
 * Enter and Escape behave the way a reader expects and screen readers announce
 * the active option.
 */
export function LocationSearch({ onSelect }: LocationSearchProps) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const geo = useGeolocation((query) => onSelect(query, 'My location'));

  useEffect(() => {
    const trimmed = term.trim();
    const controller = new AbortController();

    // Both branches run inside the timer callback rather than in the effect
    // body, so a short term clears the list without a synchronous cascade.
    // 250ms is short enough to feel instant while collapsing a typed word into
    // roughly one upstream call instead of one per keystroke.
    const timer = window.setTimeout(
      async () => {
        if (trimmed.length < 3) {
          setResults([]);
          setActiveIndex(-1);
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
            signal: controller.signal,
          });
          const payload: unknown = await response.json();
          setResults(Array.isArray(payload) ? (payload as SearchResult[]) : []);
          setActiveIndex(-1);
          setOpen(true);
        } catch {
          /* aborted or offline — leave the previous suggestions in place */
        } finally {
          setLoading(false);
        }
      },
      trimmed.length < 3 ? 0 : 250,
    );

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [term]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const choose = (result: SearchResult) => {
    onSelect(
      `${result.lat},${result.lon}`,
      [result.name, result.region, result.country].filter(Boolean).join(', '),
    );
    setTerm('');
    setResults([]);
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open || results.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      const result = results[activeIndex] ?? results[0];
      if (result) {
        event.preventDefault();
        choose(result);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur transition focus-within:border-white/60 focus-within:bg-white/20">
        <Search className="h-4 w-4 shrink-0 text-white/70" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search any city…"
          aria-label="Search for a city"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          className="w-full bg-transparent text-sm text-white placeholder:text-white/60 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin text-white/70" aria-hidden="true" />
        )}
        {term && !loading && (
          <button
            type="button"
            onClick={() => {
              setTerm('');
              setOpen(false);
            }}
            aria-label="Clear search"
            className="text-white/60 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <span className="h-5 w-px bg-white/20" aria-hidden="true" />
        <button
          type="button"
          onClick={geo.locate}
          disabled={geo.requesting}
          title="Use my location"
          aria-label="Use my location"
          className="text-white/70 transition hover:text-white disabled:opacity-50"
        >
          {geo.requesting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
        </button>
      </div>

      {geo.error && <p className="mt-1.5 px-4 text-xs text-amber-200">{geo.error}</p>}

      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800"
        >
          {results.map((result, index) => (
            <li
              key={result.id}
              id={`${listId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
            >
              <button
                type="button"
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(result)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition',
                  index === activeIndex
                    ? 'bg-brand-50 text-brand-900 dark:bg-slate-700 dark:text-white'
                    : 'text-slate-700 dark:text-slate-200',
                )}
              >
                <MapPin
                  className="h-3.5 w-3.5 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <span className="truncate">
                  <span className="font-medium">{result.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {[result.region, result.country].filter(Boolean).join(', ')
                      ? ` — ${[result.region, result.country].filter(Boolean).join(', ')}`
                      : ''}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
