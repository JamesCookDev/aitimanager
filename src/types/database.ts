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

export interface Device {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  location: string | null;
  api_key: string;
  last_ping: string | null;
  current_version_id: string | null;
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
  
  // Online if pinged within last 60 seconds
  if (diffSeconds < 60) return 'online';
  return 'offline';
}
