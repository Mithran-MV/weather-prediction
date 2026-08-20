import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CardProps {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export function Card({
  title,
  icon,
  action,
  className,
  bodyClassName,
  children,
}: CardProps) {
  return (
    <section className={cn('card flex flex-col overflow-hidden', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-5 pt-4">
          <div className="flex items-center gap-2">
            {icon && <span className="text-slate-400">{icon}</span>}
            {title && <h2 className="card-label">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      <div className={cn('flex-1 px-5 pt-3 pb-5', bodyClassName)}>{children}</div>
    </section>
  );
}
