import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './StatusBadge';
import { Device, getDeviceStatus } from '@/types/database';
import { Eye, RotateCcw, MapPin, Building2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeviceTableProps {
  devices: Device[];
  showOrganization?: boolean;
  loading?: boolean;
}

export function DeviceTable({ devices, showOrganization = false, loading }: DeviceTableProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="card-industrial rounded-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados da frota...</p>
        </div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="card-industrial rounded-lg overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum Dispositivo Encontrado</h3>
          <p className="text-muted-foreground text-sm">
            Nenhum dispositivo foi registrado para esta organização ainda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-industrial rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">
              Status
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">
              Nome do Dispositivo
            </TableHead>
            {showOrganization && (
              <TableHead className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">
                Organização
              </TableHead>
            )}
            <TableHead className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">
              Localização
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">
              Último Ping
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold uppercase text-xs tracking-wider text-right">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => {
            const status = getDeviceStatus(device.last_ping);
            const lastPingFormatted = device.last_ping
              ? formatDistanceToNow(new Date(device.last_ping), {
                  addSuffix: true,
                  locale: ptBR,
                })
              : 'Nunca';

            return (
              <TableRow
                key={device.id}
                className="table-row-industrial border-border cursor-pointer"
                onClick={() => navigate(`/dashboard/devices/${device.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    {(device as any).pending_command && (
                      <Loader2 className="w-3.5 h-3.5 text-warning animate-spin" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{device.name}</p>
                    {device.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {device.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                {showOrganization && (
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      <Building2 className="w-3 h-3 mr-1" />
                      {device.organization?.name || 'Desconhecida'}
                    </Badge>
                  </TableCell>
                )}
                <TableCell>
                  {device.location ? (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      {device.location}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'font-mono text-sm',
                      status === 'online' ? 'text-success' : 'text-muted-foreground'
                    )}
                  >
                    {lastPingFormatted}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/devices/${device.id}`);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-warning"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implementar reinício
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
