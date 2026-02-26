import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  X,
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
  Settings,
  Copy,
  Send,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type BulkScope = 'selected' | 'organization' | 'global';
type BulkAction = 'ai_prompt' | 'ai_model' | 'ui_config';

interface BulkActionsToolbarProps {
  selectedIds: string[];
  devices: Device[];
  onClearSelection: () => void;
  onSelectByOrg: (orgId: string) => void;
  onSelectAll: () => void;
  isSuperAdmin: boolean;
  onRefresh: () => void;
}

interface ActionCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'warning' | 'danger';
}

function ActionCard({ icon, label, description, onClick, disabled, variant = 'default' }: ActionCardProps) {
  const variantStyles = {
    default: 'border-border hover:border-primary/50 hover:bg-primary/5',
    warning: 'border-border hover:border-yellow-500/50 hover:bg-yellow-500/5',
    danger: 'border-border hover:border-destructive/50 hover:bg-destructive/5',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant]
      )}
    >
      <div className={cn(
        'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
        variant === 'default' && 'bg-primary/10 text-primary',
        variant === 'warning' && 'bg-yellow-500/10 text-yellow-500',
        variant === 'danger' && 'bg-destructive/10 text-destructive',
      )}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
      </div>
    </button>
  );
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
  const { profile } = useAuth();
  const [scope, setScope] = useState<BulkScope>('selected');
  const [actionDialog, setActionDialog] = useState<BulkAction | null>(null);
  const [confirmCommand, setConfirmCommand] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [aiPromptValue, setAiPromptValue] = useState('');
  const [aiModelValue, setAiModelValue] = useState('');
  const [expanded, setExpanded] = useState(false);

  if (selectedIds.length === 0) return null;

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
    setConfirmCommand(null);
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

      // Log each command in command_logs for audit trail
      if (profile?.id) {
        const logs = ids.map((deviceId) => ({
          device_id: deviceId,
          command,
          sent_by: profile.id,
          status: 'pending',
        }));
        await supabase.from('command_logs').insert(logs);
      }

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

  const commandLabels: Record<string, { label: string; desc: string }> = {
    restart: { label: 'Reiniciar', desc: 'Os totens serão reiniciados imediatamente' },
    sync: { label: 'Sincronizar', desc: 'Os totens buscarão arquivos atualizados do Hub' },
    sync_restart: { label: 'Sync + Restart', desc: 'Sincroniza e depois reinicia cada totem' },
    reload_config: { label: 'Reload Config', desc: 'Recarrega as configurações da API' },
  };

  return (
    <>
      {/* Floating panel */}
      <div className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-2xl',
        'bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl',
        'animate-in slide-in-from-bottom-4 duration-300',
        'transition-all'
      )}>
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {selectedIds.length} selecionado{selectedIds.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  {targetCount} alvo{targetCount > 1 ? 's' : ''} no escopo atual
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Scope selector */}
            <Select value={scope} onValueChange={(v) => setScope(v as BulkScope)}>
              <SelectTrigger className="w-[180px] h-8 text-xs bg-muted/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="selected">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-primary" />
                    Selecionados ({selectedIds.length})
                  </div>
                </SelectItem>
                {uniqueOrgs.length === 1 && (
                  <SelectItem value="organization">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-blue-500" />
                      Toda a organização
                    </div>
                  </SelectItem>
                )}
                {isSuperAdmin && (
                  <SelectItem value="global">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-orange-500" />
                      Global ({devices.length})
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Menos' : 'Mais ações'}
            </Button>

            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClearSelection}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick actions row - always visible */}
        <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 gap-2"
                  disabled={executing}
                  onClick={() => setConfirmCommand('restart')}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reiniciar {targetCount} totem(s)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 gap-2"
                  disabled={executing}
                  onClick={() => setConfirmCommand('sync')}
                >
                  <RefreshCw className="w-4 h-4" />
                  Sincronizar
                </Button>
              </TooltipTrigger>
              <TooltipContent>Baixar arquivos atualizados do Hub</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 gap-2"
                  disabled={executing}
                  onClick={() => setConfirmCommand('sync_restart')}
                >
                  <Send className="w-4 h-4" />
                  Sync + Restart
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sincroniza e reinicia em sequência</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 gap-2"
                  disabled={executing}
                  onClick={() => setConfirmCommand('reload_config')}
                >
                  <Settings className="w-4 h-4" />
                  Reload Config
                </Button>
              </TooltipTrigger>
              <TooltipContent>Recarrega configurações da API</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {executing && <Loader2 className="w-4 h-4 animate-spin text-primary ml-2" />}
        </div>

        {/* Expanded panel with advanced actions */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-border/50 pt-3 animate-in fade-in duration-200">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Ações avançadas
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <ActionCard
                icon={<Brain className="w-4 h-4" />}
                label="Prompt do Sistema"
                description="Alterar prompt de IA em massa"
                onClick={() => setActionDialog('ai_prompt')}
                disabled={executing}
              />
              <ActionCard
                icon={<Zap className="w-4 h-4" />}
                label="Modelo de IA"
                description="Trocar modelo (Ollama, Gemini…)"
                onClick={() => setActionDialog('ai_model')}
                disabled={executing}
              />
              <ActionCard
                icon={<Copy className="w-4 h-4" />}
                label="Copiar Layout"
                description="Replicar design de outro totem"
                onClick={() => setActionDialog('ui_config')}
                disabled={executing}
              />
            </div>
          </div>
        )}
      </div>

      {/* Confirm command dialog */}
      <AlertDialog open={!!confirmCommand} onOpenChange={(o) => !o && setConfirmCommand(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Confirmar ação em massa
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Você está prestes a enviar o comando{' '}
                <strong>"{confirmCommand && commandLabels[confirmCommand]?.label}"</strong> para{' '}
                <strong>{targetCount} dispositivo(s)</strong>.
              </span>
              <span className="block text-xs text-muted-foreground">
                {confirmCommand && commandLabels[confirmCommand]?.desc}
              </span>
              {scope === 'global' && (
                <span className="block text-destructive text-xs font-medium">
                  ⚠️ Escopo GLOBAL — todos os dispositivos da plataforma serão afetados!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmCommand && executeCommand(confirmCommand)}
              disabled={executing}
            >
              {executing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirmar ({targetCount})
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Prompt Dialog */}
      <Dialog open={actionDialog === 'ai_prompt'} onOpenChange={(o) => !o && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Alterar Prompt do Sistema
            </DialogTitle>
            <DialogDescription>
              Este prompt será aplicado a{' '}
              <Badge variant="secondary" className="mx-1">{targetCount} dispositivo(s)</Badge>
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
            <p className="text-xs text-muted-foreground">
              O prompt antigo de cada dispositivo será substituído por este novo.
            </p>
          </div>
          <DialogFooter>
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
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Alterar Modelo de IA
            </DialogTitle>
            <DialogDescription>
              O modelo será atualizado nas configs ativas de{' '}
              <Badge variant="secondary" className="mx-1">{targetCount} dispositivo(s)</Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Modelo</Label>
            <Input
              placeholder="llama3.2:1b"
              value={aiModelValue}
              onChange={(e) => setAiModelValue(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Modelos comuns: llama3.2:1b, gemini-2.5-flash, gemma3:4b
            </p>
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
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-primary" />
            Copiar Layout
          </DialogTitle>
          <DialogDescription>
            Selecione o totem de origem. O layout dele será replicado para{' '}
            <Badge variant="secondary" className="mx-1">{targetDevices.length} dispositivo(s)</Badge>
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
