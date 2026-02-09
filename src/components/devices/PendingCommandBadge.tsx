import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PendingCommandBadgeProps {
  command: string | null;
}

export function PendingCommandBadge({ command }: PendingCommandBadgeProps) {
  if (!command) return null;

  return (
    <Badge className="bg-warning/20 text-warning border-warning/30 animate-pulse">
      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      Comando pendente: {command}
    </Badge>
  );
}
