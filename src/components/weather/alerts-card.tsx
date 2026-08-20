'use client';

import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { Card } from '@/components/ui/card';
import type { WeatherAlert } from '@/lib/schemas';

export function AlertsCard({ alerts }: { alerts: WeatherAlert[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (alerts.length === 0) {
    return (
      <Card title="Alerts" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          No active weather warnings.
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={`${alerts.length} active alert${alerts.length > 1 ? 's' : ''}`}
      icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
    >
      <ul className="space-y-2">
        {alerts.map((alert, index) => (
          <li
            key={`${alert.event ?? 'alert'}-${index}`}
            className="rounded-lg border border-amber-400/40 bg-amber-50/70 p-3 dark:bg-amber-500/10"
          >
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              {alert.event ?? alert.headline ?? 'Weather alert'}
            </p>
            {alert.areas && (
              <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-200/70">
                {alert.areas}
                {alert.severity ? ` · ${alert.severity}` : ''}
              </p>
            )}
            {alert.desc && (
              <>
                <p
                  className={
                    expanded === index
                      ? 'mt-2 text-xs whitespace-pre-line text-amber-900/90 dark:text-amber-100/80'
                      : 'mt-2 line-clamp-2 text-xs text-amber-900/90 dark:text-amber-100/80'
                  }
                >
                  {alert.desc.trim()}
                </p>
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === index ? null : index)}
                  aria-expanded={expanded === index}
                  className="mt-1 text-xs font-medium text-amber-700 underline underline-offset-2 dark:text-amber-300"
                >
                  {expanded === index ? 'Show less' : 'Read full advisory'}
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
