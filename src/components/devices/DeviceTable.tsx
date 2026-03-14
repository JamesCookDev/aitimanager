import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
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
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from './StatusBadge';
import { Device, getDeviceStatus } from '@/types/database';
import { Eye, RotateCcw, MapPin, Building2, Loader2, Trash2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeviceTableProps {
  devices: Device[];
  showOrganization?: boolean;
  loading?: boolean;
  onDeviceDeleted?: () => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function DeviceTable({ devices, showOrganization = false, loading, onDeviceDeleted, selectedIds = [], onSelectionChange }: DeviceTableProps) {
  const navigate = useNavigate();
  const selectable = !!onSelectionChange;

  const toggleDevice = (id: string) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id]
    );
  };

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (selectedIds.length === devices.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(devices.map((d) => d.id));
    }
  };

  const handleDelete = async (deviceId: string, deviceName: string) => {
    try {
      const { error } = await supabase.from('devices').delete().eq('id', deviceId);
      if (error) throw error;
      toast.success(`Dispositivo "${deviceName}" removido com sucesso`);
      onDeviceDeleted?.();
    } catch (error: any) {
      toast.error('Erro ao remover dispositivo: ' + error.message);
    }
  };

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
            {selectable && (
              <TableHead className="w-10">
                <Checkbox
                  checked={devices.length > 0 && selectedIds.length === devices.length}
                  onCheckedChange={toggleAll}
                  aria-label="Selecionar todos"
                />
              </TableHead>
            )}
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
              Primeiro Boot
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
                className={cn(
                  "table-row-industrial border-border cursor-pointer",
                  selectedIds.includes(device.id) && "bg-primary/5"
                )}
                onClick={() => navigate(`/dashboard/devices/${device.id}`)}
              >
                {selectable && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(device.id)}
                      onCheckedChange={() => toggleDevice(device.id)}
                      aria-label={`Selecionar ${device.name}`}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    {device.pending_command && (
                      <Loader2 className="w-3.5 h-3.5 text-warning animate-spin" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{device.name}</p>
                      {(device.registration_method === 'enrollment' || device.registration_method === 'hardware') && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-1 border-primary/30 text-primary">
                          <Zap className="w-2.5 h-2.5" />
                          Auto
                        </Badge>
                      )}
                    </div>
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
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(device.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </span>
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Dispositivo</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover o dispositivo <strong>"{device.name}"</strong>? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(device.id, device.name)}
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
