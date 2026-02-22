import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Organization, Device, getDeviceStatus, formatTimeAgo } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/devices/StatusBadge';
import { toast } from 'sonner';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Users,
  Cpu,
  RefreshCw,
  ChevronDown,
  MapPin,
  Clock,
  ExternalLink,
  RotateCcw,
  Settings,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Navigate, useNavigate } from 'react-router-dom';
import { MetricCard } from '@/components/devices/MetricCard';

interface OrgWithDevices extends Organization {
  devices: Device[];
  userCount: number;
}

export default function Organizations() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<OrgWithDevices[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrgWithDevices | null>(null);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const isSuperAdmin = role === 'super_admin';

  useEffect(() => {
    if (isSuperAdmin) fetchOrganizations();
    else setLoading(false);
  }, [isSuperAdmin]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name');
      if (error) throw error;

      const { data: devices } = await supabase
        .from('devices')
        .select('id, org_id, name, description, location, last_ping, status_details, api_key, avatar_config, model_3d_url, is_speaking, last_interaction, current_version_id, created_at, updated_at');

      const { data: profiles } = await supabase
        .from('profiles')
        .select('org_id');

      const orgsWithDevices: OrgWithDevices[] = (orgs as Organization[]).map((org) => ({
        ...org,
        devices: (devices || []).filter((d) => d.org_id === org.id) as unknown as Device[],
        userCount: profiles?.filter((p) => p.org_id === org.id).length || 0,
      }));

      setOrganizations(orgsWithDevices);
    } catch (error) {
      console.error('Erro ao buscar organizações:', error);
      toast.error('Erro ao carregar organizações');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleNameChange = (name: string) => {
    setFormName(name);
    setFormSlug(generateSlug(name));
  };

  const handleCreate = async () => {
    if (!formName.trim() || !formSlug.trim()) { toast.error('Preencha todos os campos'); return; }
    setFormLoading(true);
    try {
      const { error } = await supabase.from('organizations').insert({ name: formName.trim(), slug: formSlug.trim() });
      if (error) throw error;
      toast.success('Organização criada com sucesso!');
      setCreateDialogOpen(false);
      setFormName(''); setFormSlug('');
      fetchOrganizations();
    } catch (error: any) {
      toast.error(error.code === '23505' ? 'Slug já existe' : 'Erro ao criar organização');
    } finally { setFormLoading(false); }
  };

  const handleEdit = async () => {
    if (!selectedOrg || !formName.trim() || !formSlug.trim()) { toast.error('Preencha todos os campos'); return; }
    setFormLoading(true);
    try {
      const { error } = await supabase.from('organizations').update({ name: formName.trim(), slug: formSlug.trim() }).eq('id', selectedOrg.id);
      if (error) throw error;
      toast.success('Organização atualizada!');
      setEditDialogOpen(false); setSelectedOrg(null); setFormName(''); setFormSlug('');
      fetchOrganizations();
    } catch (error: any) {
      toast.error(error.code === '23505' ? 'Slug já existe' : 'Erro ao atualizar organização');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!selectedOrg) return;
    if (selectedOrg.devices.length > 0) {
      toast.error('Não é possível excluir', { description: `Esta organização possui ${selectedOrg.devices.length} dispositivo(s) vinculado(s).` });
      setDeleteDialogOpen(false); return;
    }
    setFormLoading(true);
    try {
      const { error } = await supabase.from('organizations').delete().eq('id', selectedOrg.id);
      if (error) throw error;
      toast.success('Organização excluída!');
      setDeleteDialogOpen(false); setSelectedOrg(null);
      fetchOrganizations();
    } catch { toast.error('Erro ao excluir organização'); }
    finally { setFormLoading(false); }
  };

  const handleSendCommand = async (deviceId: string, command: string) => {
    try {
      const { error } = await supabase.from('devices').update({ pending_command: command, command_sent_at: new Date().toISOString() }).eq('id', deviceId);
      if (error) throw error;
      toast.success(`Comando "${command}" enviado!`);
    } catch { toast.error('Erro ao enviar comando'); }
  };

  const openEditDialog = (org: OrgWithDevices) => {
    setSelectedOrg(org); setFormName(org.name); setFormSlug(org.slug); setEditDialogOpen(true);
  };

  const openDeleteDialog = (org: OrgWithDevices) => {
    setSelectedOrg(org); setDeleteDialogOpen(true);
  };

  const toggleOrg = (orgId: string) => {
    setExpandedOrgs(prev => {
      const next = new Set(prev);
      if (next.has(orgId)) next.delete(orgId);
      else next.add(orgId);
      return next;
    });
  };

  const filteredOrganizations = useMemo(() =>
    organizations.filter(org =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.devices.some(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    ), [organizations, searchQuery]);

  const totalDevices = organizations.reduce((sum, org) => sum + org.devices.length, 0);
  const totalUsers = organizations.reduce((sum, org) => sum + org.userCount, 0);
  const onlineDevices = organizations.reduce((sum, org) => sum + org.devices.filter(d => getDeviceStatus(d.last_ping) === 'online').length, 0);

  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="p-6 space-y-6 industrial-grid min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Organizações
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hierarquia de organizações e seus dispositivos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchOrganizations} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Organização
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Organização</DialogTitle>
                <DialogDescription>Adicione uma nova organização ao sistema</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Nome da Organização</Label>
                  <Input id="create-name" placeholder="Ex: Porto Futuro" value={formName} onChange={(e) => handleNameChange(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-slug">Identificador (Slug)</Label>
                  <Input id="create-slug" placeholder="ex: porto-futuro" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} className="font-mono" />
                  <p className="text-xs text-muted-foreground">Usado para URLs e identificação única</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={formLoading}>
                  {formLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando...</> : 'Criar Organização'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Organizações" value={organizations.length} subtitle="Total cadastradas" icon={Building2} />
        <MetricCard title="Dispositivos" value={totalDevices} subtitle={`${onlineDevices} online agora`} icon={Cpu} />
        <MetricCard title="Usuários" value={totalUsers} subtitle="Vinculados" icon={Users} />
        <MetricCard title="Online" value={`${totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0}%`} subtitle="Taxa de disponibilidade" icon={Clock} />
      </div>

      {/* Search */}
      <Card className="card-industrial">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar organizações ou dispositivos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Org Cards with Accordion */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredOrganizations.length === 0 ? (
        <Card className="card-industrial">
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'Nenhuma organização encontrada' : 'Nenhuma organização cadastrada'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrganizations.map((org) => {
            const isExpanded = expandedOrgs.has(org.id);
            const orgOnlineCount = org.devices.filter(d => getDeviceStatus(d.last_ping) === 'online').length;

            return (
              <Card key={org.id} className="card-industrial overflow-hidden transition-all duration-200">
                <Collapsible open={isExpanded} onOpenChange={() => toggleOrg(org.id)}>
                  {/* Org Header */}
                  <div className="flex items-center justify-between p-4 md:p-5">
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-4 flex-1 text-left group cursor-pointer">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground truncate">{org.name}</h3>
                            <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded hidden sm:inline">
                              {org.slug}
                            </code>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Cpu className="w-3 h-3" />
                              {org.devices.length} dispositivo{org.devices.length !== 1 ? 's' : ''}
                            </span>
                            {org.devices.length > 0 && (
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                {orgOnlineCount} online
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {org.userCount} usuário{org.userCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </CollapsibleTrigger>

                    <div className="flex items-center gap-1 ml-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(org)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => openDeleteDialog(org)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Devices Accordion Content */}
                  <CollapsibleContent>
                    <div className="border-t border-border bg-muted/30">
                      {org.devices.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                          <Cpu className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Nenhum dispositivo vinculado</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {org.devices.map((device) => {
                            const status = getDeviceStatus(device.last_ping);
                            const version = (device.status_details as any)?.code_manifest?.['App.jsx'] || '—';

                            return (
                              <div key={device.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                                {/* Status indicator */}
                                <div className="shrink-0">
                                  <StatusBadge status={status} />
                                </div>

                                {/* Device info */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-foreground truncate">{device.name}</span>
                                    {device.description && (
                                      <span className="text-xs text-muted-foreground truncate hidden md:inline">
                                        — {device.description}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                                    {device.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {device.location}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatTimeAgo(device.last_ping)}
                                    </span>
                                    <span className="hidden sm:inline">
                                      v{version}
                                    </span>
                                  </div>
                                </div>

                                {/* Quick actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    variant="ghost" size="icon" className="h-7 w-7"
                                    title="Reiniciar dispositivo"
                                    onClick={() => handleSendCommand(device.id, 'restart')}
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost" size="icon" className="h-7 w-7"
                                    title="Ver detalhes"
                                    onClick={() => navigate(`/dashboard/devices/${device.id}`)}
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Organização</DialogTitle>
            <DialogDescription>Atualize as informações da organização</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da Organização</Label>
              <Input id="edit-name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Identificador (Slug)</Label>
              <Input id="edit-slug" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} className="font-mono" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={formLoading}>
              {formLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Organização</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a organização "{selectedOrg?.name}"?
              {selectedOrg && selectedOrg.devices.length > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  ⚠️ Esta organização possui {selectedOrg.devices.length} dispositivo(s). Remova-os antes de excluir.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={selectedOrg?.devices?.length ? selectedOrg.devices.length > 0 : false}
            >
              {formLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Excluindo...</> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
