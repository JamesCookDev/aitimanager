import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, Key, Bell, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function Settings() {
  const { profile, role } = useAuth();

  if (role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

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
              <Input id="name" defaultValue={profile?.full_name || ''} placeholder="Seu nome" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={profile?.email || ''} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Função</Label>
              <Input value="Super Admin" disabled />
            </div>
            <Button>Salvar alterações</Button>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Chaves de API
            </CardTitle>
            <CardDescription>Configure as chaves para integração dos totens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>URL da API (Edge Functions)</Label>
              <Input value="https://fxjszxvhzojhmcloajpt.supabase.co/functions/v1" readOnly />
            </div>
            <div className="grid gap-2">
              <Label>Endpoints disponíveis</Label>
              <div className="space-y-1 text-sm text-muted-foreground font-mono bg-muted/50 p-3 rounded-md">
                <p>POST /totem-register</p>
                <p>POST /totem-heartbeat</p>
                <p>GET  /totem-config</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Use a API Key de cada dispositivo no header{' '}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">x-totem-api-key</code>
            </p>
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
