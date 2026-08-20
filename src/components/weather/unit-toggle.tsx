'use client';

import type { UnitSystem } from '@/lib/units';
import { cn } from '@/lib/utils';

interface UnitToggleProps {
  units: UnitSystem;
  onChange: (units: UnitSystem) => void;
}

export function UnitToggle({ units, onChange }: UnitToggleProps) {
  return (
    <div
      className="flex items-center rounded-full border border-white/25 bg-white/10 p-0.5 text-xs font-medium"
      role="radiogroup"
      aria-label="Unit system"
    >
      {(['metric', 'imperial'] as const).map((value) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={units === value}
          onClick={() => onChange(value)}
          className={cn(
            'rounded-full px-2.5 py-1 transition',
            units === value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-white/70 hover:text-white',
          )}
        >
          {value === 'metric' ? '°C' : '°F'}
        </button>
      ))}
    </div>
  );
}
