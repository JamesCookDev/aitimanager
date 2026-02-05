import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusBadge } from '@/components/devices/StatusBadge';
import { Device, DeviceVersion, getDeviceStatus } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  Upload,
  FileBox,
  Clock,
  MapPin,
  Key,
  RefreshCw,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data
const mockDevice: Device = {
  id: '1',
  org_id: '1',
  name: 'Totem Entrada Principal',
  description: 'Avatar de recepção - Bloco A',
  location: 'Entrada Bloco A',
  api_key: 'rpm_a1b923ee1aff44d18e626b3c4c64bdd8',
  last_ping: new Date(Date.now() - 15000).toISOString(),
  current_version_id: 'v1',
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

const mockVersions: DeviceVersion[] = [
  {
    id: 'v1',
    device_id: '1',
    model_url: 'https://storage.example.com/models/avatar-v1.glb',
    version_notes: 'Avatar padrão - Uniforme azul',
    file_name: 'avatar-v1.glb',
    file_size: 15728640, // 15MB
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'v2',
    device_id: '1',
    model_url: 'https://storage.example.com/models/avatar-natal.glb',
    version_notes: 'Skin de Natal - Gorro e tema festivo',
    file_name: 'avatar-natal.glb',
    file_size: 18874368, // 18MB
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function DeviceDetail() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // In real app, fetch device by ID
  const device = mockDevice;
  const versions = mockVersions;
  const status = getDeviceStatus(device.last_ping);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(device.api_key);
    toast.success('API Key copied to clipboard');
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const glbFile = files.find(
      (f) => f.name.endsWith('.glb') || f.name.endsWith('.fbx')
    );

    if (glbFile) {
      handleUpload(glbFile);
    } else {
      toast.error('Invalid file type', {
        description: 'Please upload a .glb or .fbx file',
      });
    }
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    toast.loading('Uploading 3D model...', { id: 'upload' });

    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setUploading(false);
    toast.success('Model uploaded successfully!', {
      id: 'upload',
      description: `${file.name} (${formatFileSize(file.size)})`,
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className="p-6 space-y-6 industrial-grid min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Monitor
        </Button>
      </div>

      {/* Device Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <FileBox className="w-7 h-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{device.name}</h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              {device.description}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="border-warning text-warning hover:bg-warning/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Restart Device
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Zone */}
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Deploy New Model
              </CardTitle>
              <CardDescription>
                Upload a new 3D avatar model (.glb or .fbx) to update this device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  'dropzone cursor-pointer',
                  isDragging && 'dropzone-active'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".glb,.fbx"
                  className="hidden"
                  onChange={handleFileInput}
                  disabled={uploading}
                />

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Upload
                      className={cn(
                        'w-8 h-8 text-primary',
                        uploading && 'animate-pulse'
                      )}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {uploading ? 'Uploading...' : 'Update 3D Model'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Drag and drop your .glb or .fbx file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Maximum file size: 50MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version History */}
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Version History
              </CardTitle>
              <CardDescription>
                Previously deployed models for this device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border transition-colors',
                    index === 0
                      ? 'bg-primary/5 border-primary/30'
                      : 'bg-muted/30 border-border hover:border-border/80'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        index === 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <FileBox className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {version.file_name}
                        </p>
                        {index === 0 && (
                          <Badge className="bg-primary/20 text-primary border-primary/30">
                            <Check className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {version.version_notes}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(version.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}{' '}
                        • {formatFileSize(version.file_size || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Device Info */}
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-base">Device Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Location
                </p>
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  {device.location || 'Not specified'}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Last Ping
                </p>
                <p className="text-foreground font-mono text-sm">
                  {device.last_ping
                    ? formatDistanceToNow(new Date(device.last_ping), {
                        addSuffix: true,
                        locale: ptBR,
                      })
                    : 'Never'}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Created
                </p>
                <p className="text-foreground text-sm">
                  {format(new Date(device.created_at), "dd 'de' MMMM, yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* API Key */}
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                API Key
              </CardTitle>
              <CardDescription>
                Use this key to authenticate device pings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-input rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs font-mono text-foreground break-all">
                    {showApiKey
                      ? device.api_key
                      : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleCopyApiKey}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
