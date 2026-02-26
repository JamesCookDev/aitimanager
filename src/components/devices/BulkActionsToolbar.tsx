import { useState } from 'react';
import { Device } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  X,
  ChevronDown,
  RotateCcw,
  RefreshCw,
  Brain,
  Paintbrush,
  Zap,
  Globe,
  Building2,
  CheckSquare,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type BulkScope = 'selected' | 'organization' | 'global';
type BulkAction = 'command_restart' | 'command_sync' | 'ai_prompt' | 'ai_model' | 'ui_config';

interface BulkActionsToolbarProps {
  selectedIds: string[];
  devices: Device[];
  onClearSelection: () => void;
  onSelectByOrg: (orgId: string) => void;
  onSelectAll: () => void;
  isSuperAdmin: boolean;
  onRefresh: () => void;
}

export function BulkActionsToolbar({
  selectedIds,
  devices,
  onClearSelection,
  onSelectByOrg,
  onSelectAll,
  isSuperAdmin,
  onRefresh,
}: BulkActionsToolbarProps) {
  const [scope, setScope] = useState<BulkScope>('selected');
  const [actionDialog, setActionDialog] = useState<BulkAction | null>(null);
  const [executing, setExecuting] = useState(false);
  const [aiPromptValue, setAiPromptValue] = useState('');
  const [aiModelValue, setAiModelValue] = useState('');

  if (selectedIds.length === 0) return null;

  // Get unique orgs from selected devices
  const selectedDevices = devices.filter((d) => selectedIds.includes(d.id));
  const uniqueOrgs = [...new Set(selectedDevices.map((d) => d.org_id))];

  const getTargetDevices = (): Device[] => {
    switch (scope) {
      case 'selected':
        return selectedDevices;
      case 'organization':
        if (uniqueOrgs.length === 1) {
          return devices.filter((d) => d.org_id === uniqueOrgs[0]);
        }
        return selectedDevices;
      case 'global':
        return devices;
      default:
        return selectedDevices;
    }
  };

  const targetDevices = getTargetDevices();
  const targetCount = targetDevices.length;

  const executeCommand = async (command: string) => {
    setExecuting(true);
    try {
      const ids = targetDevices.map((d) => d.id);
      const { error } = await supabase
        .from('devices')
        .update({
          pending_command: command,
          command_sent_at: new Date().toISOString(),
        })
        .in('id', ids);

      if (error) throw error;
      toast.success(`Comando "${command}" enviado para ${ids.length} dispositivo(s)`);
      onClearSelection();
      onRefresh();
    } catch (err: any) {
      toast.error('Erro ao enviar comando: ' + err.message);
    } finally {
      setExecuting(false);
    }
  };

  const executeAiUpdate = async () => {
    setExecuting(true);
    try {
      const ids = targetDevices.map((d) => d.id);
      const updateData: Record<string, unknown> = {};

      if (actionDialog === 'ai_prompt' && aiPromptValue.trim()) {
        updateData.ai_prompt = aiPromptValue.trim();
      }
      if (actionDialog === 'ai_model' && aiModelValue.trim()) {
        // Update ai_configs for these devices
        for (const device of targetDevices) {
          const { data: existingConfig } = await supabase
            .from('ai_configs')
            .select('id')
            .eq('device_id', device.id)
            .eq('is_active', true)
            .maybeSingle();

          if (existingConfig) {
            await supabase
              .from('ai_configs')
              .update({ model: aiModelValue.trim() })
              .eq('id', existingConfig.id);
          }
        }
        toast.success(`Modelo IA atualizado para ${ids.length} dispositivo(s)`);
        setActionDialog(null);
        setAiModelValue('');
        onClearSelection();
        onRefresh();
        setExecuting(false);
        return;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase.from('devices').update(updateData).in('id', ids);
        if (error) throw error;
        toast.success(`IA atualizada para ${ids.length} dispositivo(s)`);
      }

      setActionDialog(null);
      setAiPromptValue('');
      onClearSelection();
      onRefresh();
    } catch (err: any) {
      toast.error('Erro ao atualizar IA: ' + err.message);
    } finally {
      setExecuting(false);
    }
  };

  const scopeLabel: Record<BulkScope, string> = {
    selected: `${selectedIds.length} selecionado(s)`,
    organization: uniqueOrgs.length === 1 ? 'Toda a organização' : `${uniqueOrgs.length} orgs`,
    global: 'Todos os dispositivos',
  };

  return (
    <>
      {/* Floating toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card border border-border rounded-xl shadow-2xl px-4 py-3 animate-in slide-in-from-bottom-4">
        {/* Selection count */}
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{selectedIds.length}</span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClearSelection}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Scope selector */}
        <Select value={scope} onValueChange={(v) => setScope(v as BulkScope)}>
          <SelectTrigger className="w-[200px] h-8 text-xs bg-muted/50 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="selected">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5" />
                Selecionados ({selectedIds.length})
              </div>
            </SelectItem>
            {uniqueOrgs.length === 1 && (
              <SelectItem value="organization">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />
                  Toda a organização
                </div>
              </SelectItem>
            )}
            {isSuperAdmin && (
              <SelectItem value="global">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" />
                  Global ({devices.length})
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        <Badge variant="secondary" className="text-xs">
          {targetCount} alvo(s)
        </Badge>

        <div className="w-px h-6 bg-border" />

        {/* Commands dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={executing}>
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Comandos
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => executeCommand('restart')}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar ({targetCount})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => executeCommand('sync')}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sincronizar ({targetCount})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => executeCommand('sync_restart')}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync + Restart ({targetCount})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => executeCommand('reload_config')}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Config ({targetCount})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* AI dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={executing}>
              <Brain className="w-3.5 h-3.5 mr-1.5" />
              IA
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => setActionDialog('ai_prompt')}>
              Alterar Prompt do Sistema
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActionDialog('ai_model')}>
              Alterar Modelo IA
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Layout actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled={executing}>
              <Paintbrush className="w-3.5 h-3.5 mr-1.5" />
              Layout
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => setActionDialog('ui_config')}>
              Copiar Layout de um Dispositivo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {executing && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
      </div>

      {/* AI Prompt Dialog */}
      <Dialog open={actionDialog === 'ai_prompt'} onOpenChange={(o) => !o && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Prompt do Sistema</DialogTitle>
            <DialogDescription>
              Este prompt será aplicado a{' '}
              <strong>{targetCount} dispositivo(s)</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Novo Prompt</Label>
            <Textarea
              rows={6}
              placeholder="Você é um assistente virtual amigável..."
              value={aiPromptValue}
              onChange={(e) => setAiPromptValue(e.target.value)}
            />
          </div>
          <DialogFooter className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-warning mr-auto">
              <AlertTriangle className="w-3.5 h-3.5" />
              Ação irreversível em massa
            </div>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={executeAiUpdate} disabled={executing || !aiPromptValue.trim()}>
              {executing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Aplicar para {targetCount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Model Dialog */}
      <Dialog open={actionDialog === 'ai_model'} onOpenChange={(o) => !o && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Modelo de IA</DialogTitle>
            <DialogDescription>
              O modelo será atualizado nas configs ativas de{' '}
              <strong>{targetCount} dispositivo(s)</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Modelo</Label>
            <Input
              placeholder="llama3.2:1b"
              value={aiModelValue}
              onChange={(e) => setAiModelValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={executeAiUpdate} disabled={executing || !aiModelValue.trim()}>
              {executing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Aplicar para {targetCount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UI Config Copy Dialog */}
      <CopyLayoutDialog
        open={actionDialog === 'ui_config'}
        onClose={() => setActionDialog(null)}
        devices={devices}
        targetDevices={targetDevices}
        onRefresh={onRefresh}
        onClearSelection={onClearSelection}
      />
    </>
  );
}

// Sub-component for copying layout from one device to many
function CopyLayoutDialog({
  open,
  onClose,
  devices,
  targetDevices,
  onRefresh,
  onClearSelection,
}: {
  open: boolean;
  onClose: () => void;
  devices: Device[];
  targetDevices: Device[];
  onRefresh: () => void;
  onClearSelection: () => void;
}) {
  const [sourceId, setSourceId] = useState('');
  const [executing, setExecuting] = useState(false);

  const handleApply = async () => {
    if (!sourceId) return;
    setExecuting(true);
    try {
      // Get source device ui_config
      const { data: source, error: fetchErr } = await supabase
        .from('devices')
        .select('ui_config')
        .eq('id', sourceId)
        .single();

      if (fetchErr || !source) throw fetchErr || new Error('Device não encontrado');

      const ids = targetDevices.map((d) => d.id).filter((id) => id !== sourceId);
      if (ids.length === 0) {
        toast.info('Nenhum dispositivo alvo diferente da fonte');
        return;
      }

      const { error } = await supabase
        .from('devices')
        .update({ ui_config: source.ui_config })
        .in('id', ids);

      if (error) throw error;
      toast.success(`Layout copiado para ${ids.length} dispositivo(s)`);
      onClose();
      onClearSelection();
      onRefresh();
    } catch (err: any) {
      toast.error('Erro ao copiar layout: ' + err.message);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Copiar Layout</DialogTitle>
          <DialogDescription>
            Selecione o dispositivo de origem. O layout dele será aplicado a{' '}
            <strong>{targetDevices.length} dispositivo(s)</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label>Dispositivo Fonte</Label>
          <Select value={sourceId} onValueChange={setSourceId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um dispositivo..." />
            </SelectTrigger>
            <SelectContent>
              {devices.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name} {d.organization?.name ? `(${d.organization.name})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleApply} disabled={executing || !sourceId}>
            {executing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Copiar Layout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
