'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { useHydrated } from '@/hooks/use-hydrated';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'dark', label: 'Dark', Icon: Moon },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // `theme` is undefined until the provider reads localStorage; rendering the
  // active state before then would flash the wrong pill.
  const mounted = useHydrated();

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-white/25 bg-white/10 p-0.5"
      role="radiogroup"
      aria-label="Colour theme"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={mounted && theme === value}
          aria-label={label}
          onClick={() => setTheme(value)}
          className={cn(
            'rounded-full p-1.5 transition',
            mounted && theme === value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-white/70 hover:bg-white/15 hover:text-white',
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </button>
      ))}
    </div>
  );
}
