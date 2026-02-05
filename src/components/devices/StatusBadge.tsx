import { cn } from '@/lib/utils';
import { DeviceStatus } from '@/types/database';

interface StatusBadgeProps {
  status: DeviceStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider',
        status === 'online' && 'bg-success/20 text-success border border-success/30',
        status === 'offline' && 'bg-destructive/20 text-destructive border border-destructive/30',
        status === 'unknown' && 'bg-muted text-muted-foreground border border-border',
        className
      )}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          status === 'online' && 'status-online',
          status === 'offline' && 'status-offline',
          status === 'unknown' && 'bg-muted-foreground'
        )}
      />
      {status}
    </div>
  );
}
