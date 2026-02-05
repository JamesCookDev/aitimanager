import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DeviceTable } from '@/components/devices/DeviceTable';
import { MetricCard } from '@/components/devices/MetricCard';
import { Device, Organization, getDeviceStatus } from '@/types/database';
import { Activity, Cpu, WifiOff, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data for initial visualization
const mockOrganizations: Organization[] = [
  { id: '1', name: 'Porto Futuro', slug: 'porto-futuro', created_at: '', updated_at: '' },
  { id: '2', name: 'Shopping Bosque', slug: 'shopping-bosque', created_at: '', updated_at: '' },
  { id: '3', name: 'Estação das Docas', slug: 'estacao-docas', created_at: '', updated_at: '' },
];

const mockDevices: Device[] = [
  {
    id: '1',
    org_id: '1',
    name: 'Totem Entrada Principal',
    description: 'Avatar de recepção - Bloco A',
    location: 'Entrada Bloco A',
    api_key: 'rpm_a1b923ee1aff44d18e626b3c4c64bdd8',
    last_ping: new Date(Date.now() - 15000).toISOString(), // 15 seconds ago - ONLINE
    current_version_id: null,
    created_at: '',
    updated_at: '',
    organization: mockOrganizations[0],
  },
  {
    id: '2',
    org_id: '1',
    name: 'Totem Praça de Alimentação',
    description: 'Informações gastronômicas',
    location: 'Praça de Alimentação',
    api_key: 'rpm_b2c034ff2bgg55e29f737d4d5e75cef9',
    last_ping: new Date(Date.now() - 30000).toISOString(), // 30 seconds ago - ONLINE
    current_version_id: null,
    created_at: '',
    updated_at: '',
    organization: mockOrganizations[0],
  },
  {
    id: '3',
    org_id: '1',
    name: 'Totem Estacionamento',
    description: 'Orientação de vagas',
    location: 'Subsolo -1',
    api_key: 'rpm_c3d145gg3chh66f30g848e5f6f86dfga',
    last_ping: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago - OFFLINE
    current_version_id: null,
    created_at: '',
    updated_at: '',
    organization: mockOrganizations[0],
  },
  {
    id: '4',
    org_id: '2',
    name: 'Totem Cinema',
    description: 'Programação e ingressos',
    location: '3º Piso',
    api_key: 'rpm_d4e256hh4dii77g41h959f6g7g97egfb',
    last_ping: new Date(Date.now() - 45000).toISOString(), // 45 seconds ago - ONLINE
    current_version_id: null,
    created_at: '',
    updated_at: '',
    organization: mockOrganizations[1],
  },
  {
    id: '5',
    org_id: '2',
    name: 'Totem Loja Âncora',
    description: 'Promoções especiais',
    location: 'Térreo - Loja 102',
    api_key: 'rpm_e5f367ii5ejj88h52i060g7h8h08fhgc',
    last_ping: new Date(Date.now() - 86400000).toISOString(), // 1 day ago - OFFLINE
    current_version_id: null,
    created_at: '',
    updated_at: '',
    organization: mockOrganizations[1],
  },
  {
    id: '6',
    org_id: '3',
    name: 'Totem Pier',
    description: 'Informações turísticas',
    location: 'Deck Principal',
    api_key: 'rpm_f6g478jj6fkk99i63j171h8i9i19gihd',
    last_ping: new Date(Date.now() - 20000).toISOString(), // 20 seconds ago - ONLINE
    current_version_id: null,
    created_at: '',
    updated_at: '',
    organization: mockOrganizations[2],
  },
];

export default function Dashboard() {
  const { role } = useAuth();
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = role === 'super_admin';

  // Filter devices based on selected org (simulating RLS)
  const filteredDevices =
    selectedOrg === 'all'
      ? devices
      : devices.filter((d) => d.org_id === selectedOrg);

  // Calculate metrics
  const onlineCount = filteredDevices.filter(
    (d) => getDeviceStatus(d.last_ping) === 'online'
  ).length;
  const offlineCount = filteredDevices.filter(
    (d) => getDeviceStatus(d.last_ping) === 'offline'
  ).length;
  const totalCount = filteredDevices.length;
  const uptimePercent = totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 0;

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6 industrial-grid min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Live Monitor
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time fleet status and device management
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Org filter (Super Admin only) */}
          {isSuperAdmin && (
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="w-[200px] bg-input border-border">
                <SelectValue placeholder="Filter by organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {mockOrganizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="outline"
            size="sm"
            className="border-border"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Devices"
          value={totalCount}
          subtitle="Registered in fleet"
          icon={Cpu}
        />
        <MetricCard
          title="Online"
          value={onlineCount}
          subtitle="Last 60 seconds"
          icon={Zap}
          variant="success"
        />
        <MetricCard
          title="Offline"
          value={offlineCount}
          subtitle="Needs attention"
          icon={WifiOff}
          variant={offlineCount > 0 ? 'danger' : 'default'}
        />
        <MetricCard
          title="Uptime"
          value={`${uptimePercent}%`}
          subtitle="Fleet availability"
          icon={Activity}
          variant={uptimePercent >= 90 ? 'success' : uptimePercent >= 70 ? 'warning' : 'danger'}
        />
      </div>

      {/* Device Table */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Fleet Status</h2>
        <DeviceTable
          devices={filteredDevices}
          showOrganization={isSuperAdmin && selectedOrg === 'all'}
          loading={loading}
        />
      </div>
    </div>
  );
}
