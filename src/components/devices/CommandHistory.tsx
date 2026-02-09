import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Terminal, Check, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CommandLog {
  id: string;
  device_id: string;
  command: string;
  sent_by: string;
  sent_at: string;
  executed_at: string | null;
  status: string;
}

interface CommandHistoryProps {
  deviceId: string;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: 'Pendente', icon: Clock, className: 'bg-warning/20 text-warning border-warning/30' },
  executed: { label: 'Executado', icon: Check, className: 'bg-success/20 text-success border-success/30' },
  expired: { label: 'Expirado', icon: AlertTriangle, className: 'bg-muted text-muted-foreground border-border' },
};

export function CommandHistory({ deviceId }: CommandHistoryProps) {
  const [logs, setLogs] = useState<CommandLog[]>([]);

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel(`command-logs-${deviceId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'command_logs',
        filter: `device_id=eq.${deviceId}`,
      }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [deviceId]);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('command_logs')
      .select('*')
      .eq('device_id', deviceId)
      .order('sent_at', { ascending: false })
      .limit(20);

    if (data) setLogs(data as CommandLog[]);
  };

  return (
    <Card className="card-industrial">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          Histórico de Comandos
        </CardTitle>
        <CardDescription>
          Comandos enviados para este dispositivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {logs.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-4">
            Nenhum comando enviado ainda
          </p>
        )}
        {logs.map((log) => {
          const config = statusConfig[log.status] || statusConfig.pending;
          const Icon = config.icon;
          return (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm capitalize">{log.command}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.sent_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
              <Badge className={config.className}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
