import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, Key, Bell, Shield, Copy, Check, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function Settings() {
  const { profile, role, user } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAnonKey, setShowAnonKey] = useState(false);

  if (role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error('Nome não pode estar vazio');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', user?.id || '');
      if (error) throw error;
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0"
      onClick={() => copyToClipboard(text, field)}
    >
      {copiedField === field ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground" />
      )}
    </Button>
  );

  return (
    <div className="p-6 space-y-6 industrial-grid min-h-screen">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-primary" />
            Configurações
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Painel de configurações do Super Admin
          </p>
        </div>
        <Badge variant="outline" className="ml-auto">
          <Shield className="w-3 h-3 mr-1" />
          Super Admin
        </Badge>
      </div>

      <div className="grid gap-6 max-w-3xl">
        {/* Perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil
            </CardTitle>
            <CardDescription>Informações da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={profile?.email || ''} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Função</Label>
              <Input value="Super Admin" disabled />
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Chaves de API
            </CardTitle>
            <CardDescription>Credenciais para integração dos totens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* API URL */}
            <div className="grid gap-2">
              <Label>URL da API (Edge Functions)</Label>
              <div className="flex items-center gap-2">
                <Input value={apiUrl} readOnly className="font-mono text-xs" />
                <CopyButton text={apiUrl} field="api-url" />
              </div>
            </div>

            {/* Anon Key */}
            <div className="grid gap-2">
              <Label>Chave Pública (Anon Key)</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={showAnonKey ? anonKey : '•'.repeat(40)}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setShowAnonKey(!showAnonKey)}
                >
                  {showAnonKey ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <CopyButton text={anonKey} field="anon-key" />
              </div>
              <p className="text-xs text-muted-foreground">
                Esta é a chave pública. Segura para uso no client-side.
              </p>
            </div>

            <Separator />

            {/* Endpoints */}
            <div className="grid gap-2">
              <Label>Endpoints disponíveis</Label>
              <div className="space-y-2">
                {[
                  { method: 'POST', path: '/totem-register', desc: 'Registra um novo totem' },
                  { method: 'POST', path: '/totem-heartbeat', desc: 'Envia heartbeat do totem' },
                  { method: 'GET', path: '/totem-config', desc: 'Busca configuração do totem' },
                ].map((ep) => (
                  <div
                    key={ep.path}
                    className="flex items-center justify-between bg-muted/50 p-3 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {ep.method}
                      </Badge>
                      <code className="text-sm font-mono">{ep.path}</code>
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:block">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Como autenticar</p>
              <p className="text-sm text-muted-foreground">
                Cada dispositivo possui uma <strong>API Key</strong> única gerada automaticamente.
                Use-a no header da requisição:
              </p>
              <code className="block bg-muted px-3 py-2 rounded text-xs font-mono">
                x-totem-api-key: {'<api_key_do_dispositivo>'}
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                A API Key de cada dispositivo pode ser encontrada na página de detalhes do dispositivo.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
            <CardDescription>Configure alertas e notificações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas de dispositivo offline</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificação quando um totem ficar offline
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Resumo diário</Label>
                <p className="text-sm text-muted-foreground">
                  Receber relatório diário por email
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
