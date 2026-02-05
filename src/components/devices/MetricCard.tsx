import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  className,
}: MetricCardProps) {
  return (
    <div className={cn('card-industrial rounded-lg p-5', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="metric-label mb-1">{title}</p>
          <p
            className={cn(
              'metric-value',
              variant === 'success' && 'text-success',
              variant === 'warning' && 'text-warning',
              variant === 'danger' && 'text-destructive'
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            variant === 'default' && 'bg-primary/10 text-primary',
            variant === 'success' && 'bg-success/10 text-success',
            variant === 'warning' && 'bg-warning/10 text-warning',
            variant === 'danger' && 'bg-destructive/10 text-destructive'
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
