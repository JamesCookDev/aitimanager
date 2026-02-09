import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Organization } from '@/types/database';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Navigate } from 'react-router-dom';
import { MetricCard } from '@/components/devices/MetricCard';

interface OrgWithCounts extends Organization {
  deviceCount: number;
  userCount: number;
}

export default function Organizations() {
  const { role } = useAuth();
  const [organizations, setOrganizations] = useState<OrgWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrgWithCounts | null>(null);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const isSuperAdmin = role === 'super_admin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchOrganizations();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name');
      if (error) throw error;

      // Fetch device counts
      const { data: devices } = await supabase
        .from('devices')
        .select('org_id');

      // Fetch user counts
      const { data: profiles } = await supabase
        .from('profiles')
        .select('org_id');

      const orgsWithCounts: OrgWithCounts[] = (orgs as Organization[]).map((org) => ({
        ...org,
        deviceCount: devices?.filter((d) => d.org_id === org.id).length || 0,
        userCount: profiles?.filter((p) => p.org_id === org.id).length || 0,
      }));

      setOrganizations(orgsWithCounts);
    } catch (error) {
      console.error('Erro ao buscar organizações:', error);
      toast.error('Erro ao carregar organizações');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormName(name);
    setFormSlug(generateSlug(name));
  };

  const handleCreate = async () => {
    if (!formName.trim() || !formSlug.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setFormLoading(true);
    try {
      const { error } = await supabase.from('organizations').insert({
        name: formName.trim(),
        slug: formSlug.trim(),
      });

      if (error) throw error;

      toast.success('Organização criada com sucesso!');
      setCreateDialogOpen(false);
      setFormName('');
      setFormSlug('');
      fetchOrganizations();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Slug já existe', { description: 'Escolha um identificador único' });
      } else {
        toast.error('Erro ao criar organização');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedOrg || !formName.trim() || !formSlug.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setFormLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name: formName.trim(), slug: formSlug.trim() })
        .eq('id', selectedOrg.id);

      if (error) throw error;

      toast.success('Organização atualizada!');
      setEditDialogOpen(false);
      setSelectedOrg(null);
      setFormName('');
      setFormSlug('');
      fetchOrganizations();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Slug já existe');
      } else {
        toast.error('Erro ao atualizar organização');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrg) return;

    if (selectedOrg.deviceCount > 0) {
      toast.error('Não é possível excluir', {
        description: `Esta organização possui ${selectedOrg.deviceCount} dispositivo(s) vinculado(s).`,
      });
      setDeleteDialogOpen(false);
      return;
    }

    setFormLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', selectedOrg.id);

      if (error) throw error;

      toast.success('Organização excluída!');
      setDeleteDialogOpen(false);
      setSelectedOrg(null);
      fetchOrganizations();
    } catch (error) {
      toast.error('Erro ao excluir organização', {
        description: 'Verifique se não há dispositivos ou usuários vinculados',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const openEditDialog = (org: OrgWithCounts) => {
    setSelectedOrg(org);
    setFormName(org.name);
    setFormSlug(org.slug);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (org: OrgWithCounts) => {
    setSelectedOrg(org);
    setDeleteDialogOpen(true);
  };

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDevices = organizations.reduce((sum, org) => sum + org.deviceCount, 0);
  const totalUsers = organizations.reduce((sum, org) => sum + org.userCount, 0);

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

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
            Gerencie as organizações e seus clientes
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
                <DialogDescription>
                  Adicione uma nova organização ao sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Nome da Organização</Label>
                  <Input
                    id="create-name"
                    placeholder="Ex: Porto Futuro"
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-slug">Identificador (Slug)</Label>
                  <Input
                    id="create-slug"
                    placeholder="ex: porto-futuro"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Usado para URLs e identificação única
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Organização'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Organizações" value={organizations.length} subtitle="Total cadastradas" icon={Building2} />
        <MetricCard title="Dispositivos" value={totalDevices} subtitle="Em todas as orgs" icon={Cpu} />
        <MetricCard title="Usuários" value={totalUsers} subtitle="Vinculados" icon={Users} />
      </div>

      {/* Search */}
      <Card className="card-industrial">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar organizações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="card-industrial">
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Organizações ({filteredOrganizations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredOrganizations.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'Nenhuma organização encontrada' : 'Nenhuma organização cadastrada'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Nome</TableHead>
                  <TableHead className="text-muted-foreground">Slug</TableHead>
                  <TableHead className="text-muted-foreground text-center">Dispositivos</TableHead>
                  <TableHead className="text-muted-foreground text-center">Usuários</TableHead>
                  <TableHead className="text-muted-foreground">Criado em</TableHead>
                  <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.map((org) => (
                  <TableRow key={org.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{org.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        {org.slug}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={org.deviceCount > 0 ? 'default' : 'secondary'}>
                        {org.deviceCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={org.userCount > 0 ? 'default' : 'secondary'}>
                        {org.userCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(org.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(org)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => openDeleteDialog(org)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
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
              {selectedOrg && selectedOrg.deviceCount > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  ⚠️ Esta organização possui {selectedOrg.deviceCount} dispositivo(s). Remova-os antes de excluir.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={selectedOrg?.deviceCount ? selectedOrg.deviceCount > 0 : false}
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
