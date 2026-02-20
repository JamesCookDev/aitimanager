// Local types for the application (extends auto-generated types)

export type AppRole = 'super_admin' | 'org_admin';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  org_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface AvatarColors {
  shirt: string;
  pants: string;
  shoes: string;
}

export interface AvatarMaterial {
  metalness: number;
  roughness: number;
}

export interface AvatarConfig {
  colors: AvatarColors;
  material: AvatarMaterial;
  textures?: Record<string, string>;
  animation: string;
}

export interface DeviceStatusDetails {
  version?: string;
  uptime?: number;
  memory_usage?: number;
  cpu_usage?: number;
  last_error?: string;
}

export interface Device {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  location: string | null;
  api_key: string;
  last_ping: string | null;
  current_version_id: string | null;
  avatar_config: AvatarConfig | null;
  model_3d_url: string | null;
  is_speaking: boolean;
  last_interaction: string | null;
  status_details: DeviceStatusDetails | null;
  created_at: string;
  updated_at: string;
  // Computed field
  organization?: Organization;
}

export interface DeviceVersion {
  id: string;
  device_id: string;
  model_url: string;
  version_notes: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
}

// Helper type for device status calculation
export type DeviceStatus = 'online' | 'offline' | 'unknown';

export function getDeviceStatus(lastPing: string | null): DeviceStatus {
  if (!lastPing) return 'unknown';
  
  const pingTime = new Date(lastPing).getTime();
  const now = Date.now();
  const diffSeconds = (now - pingTime) / 1000;
  
  // Online if pinged within last 90 seconds
  if (diffSeconds < 90) return 'online';
  return 'offline';
}

// Helper to format time ago in PT-BR
export function formatTimeAgo(date: string | null): string {
  if (!date) return 'Nunca';
  
  const now = Date.now();
  const time = new Date(date).getTime();
  const diffSeconds = Math.floor((now - time) / 1000);
  
  if (diffSeconds < 60) return `${diffSeconds}s atrás`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}min atrás`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h atrás`;
  return `${Math.floor(diffSeconds / 86400)}d atrás`;
}
