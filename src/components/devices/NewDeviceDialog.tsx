import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
  const [saving, setSaving] = useState(false);

  const isSuperAdmin = role === 'super_admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('O nome do dispositivo é obrigatório.');
      return;
    }

    const targetOrgId = isSuperAdmin ? orgId.trim() : profile?.org_id;

    if (!targetOrgId) {
      toast.error('Organização não identificada. Verifique sua conta.');
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
              <Label htmlFor="device-org">ID da Organização *</Label>
              <Input
                id="device-org"
                placeholder="UUID da organização"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                disabled={saving}
              />
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
