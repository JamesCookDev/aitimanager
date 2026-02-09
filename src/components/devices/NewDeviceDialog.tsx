import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Organization } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface NewDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeviceCreated?: () => void;
}

export function NewDeviceDialog({ open, onOpenChange, onDeviceCreated }: NewDeviceDialogProps) {
  const { profile, role } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [orgId, setOrgId] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const isSuperAdmin = role === 'super_admin';

  useEffect(() => {
    if (open && isSuperAdmin) {
      fetchOrganizations();
    }
  }, [open, isSuperAdmin]);

  const fetchOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name');
      if (error) throw error;
      setOrganizations(data as Organization[]);
    } catch (error) {
      console.error('Erro ao buscar organizações:', error);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('O nome do dispositivo é obrigatório.');
      return;
    }

    const targetOrgId = isSuperAdmin ? orgId : profile?.org_id;

    if (!targetOrgId) {
      toast.error('Selecione uma organização.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('devices').insert({
        name: name.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        org_id: targetOrgId,
      });

      if (error) throw error;

      toast.success('Dispositivo criado com sucesso!');
      resetForm();
      onOpenChange(false);
      onDeviceCreated?.();
    } catch (error: any) {
      console.error('Erro ao criar dispositivo:', error);
      toast.error(error.message || 'Erro ao criar dispositivo.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setLocation('');
    setOrgId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Novo Dispositivo</DialogTitle>
          <DialogDescription>
            Cadastre um novo totem para sua organização.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device-name">Nome *</Label>
            <Input
              id="device-name"
              placeholder="Ex: Totem Recepção"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="device-description">Descrição</Label>
            <Textarea
              id="device-description"
              placeholder="Descrição opcional do dispositivo"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="device-location">Localização</Label>
            <Input
              id="device-location"
              placeholder="Ex: Lobby principal, 1º andar"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={saving}
            />
          </div>

          {isSuperAdmin && (
            <div className="space-y-2">
              <Label>Organização *</Label>
              <Select value={orgId} onValueChange={setOrgId} disabled={saving || loadingOrgs}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingOrgs ? 'Carregando...' : 'Selecione uma organização'} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar Dispositivo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
