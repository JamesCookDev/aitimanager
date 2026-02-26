import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Terminal,
  Check,
  Clock,
  AlertTriangle,
  XCircle,
  Truck,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Device } from '@/types/database';

interface CommandLog {
  id: string;
  device_id: string;
  command: string;
  sent_by: string;
  sent_at: string;
  executed_at: string | null;
  status: string;
}

interface GlobalCommandHistoryProps {
  devices: Device[];
  isSuperAdmin: boolean;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: 'Pendente', icon: Clock, className: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30' },
  delivered: { label: 'Entregue', icon: Truck, className: 'bg-blue-500/15 text-blue-500 border-blue-500/30' },
  executed: { label: 'Executado', icon: Check, className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  failed: { label: 'Falhou', icon: XCircle, className: 'bg-destructive/15 text-destructive border-destructive/30' },
  expired: { label: 'Expirado', icon: AlertTriangle, className: 'bg-muted text-muted-foreground border-border' },
};

export function GlobalCommandHistory({ devices, isSuperAdmin }: GlobalCommandHistoryProps) {
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDevice, setFilterDevice] = useState<string>('all');

  const deviceMap = new Map(devices.map((d) => [d.id, d]));

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('global-command-logs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'command_logs',
      }, () => fetchLogs())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase
      .from('command_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50);

    const { data } = await query;
    if (data) setLogs(data as CommandLog[]);
    setLoading(false);
  };

  const filtered = logs.filter((l) => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (filterDevice !== 'all' && l.device_id !== filterDevice) return false;
    return true;
  });

  return (
    <div className="card-industrial rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Histórico de Comandos</h3>
          <Badge variant="secondary" className="text-xs">{filtered.length}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <Filter className="w-3 h-3 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
              <SelectItem value="executed">Executado</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterDevice} onValueChange={setFilterDevice}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Dispositivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os dispositivos</SelectItem>
              {devices.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" className="h-8" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          Nenhum comando registrado
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">Status</TableHead>
              <TableHead className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">Comando</TableHead>
              <TableHead className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">Dispositivo</TableHead>
              <TableHead className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">Enviado</TableHead>
              <TableHead className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">Executado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => {
              const config = statusConfig[log.status] || statusConfig.pending;
              const Icon = config.icon;
              const device = deviceMap.get(log.device_id);

              return (
                <TableRow key={log.id} className="border-border">
                  <TableCell>
                    <Badge variant="outline" className={config.className}>
                      <Icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm font-mono text-foreground bg-muted/50 px-2 py-0.5 rounded">
                      {log.command}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">
                      {device?.name || log.device_id.slice(0, 8)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.sent_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  </TableCell>
                  <TableCell>
                    {log.executed_at ? (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.executed_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
