import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, FileCode2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────
interface ManifestFile {
  version: string;
  description: string;
  critical: boolean;
}

interface HubManifest {
  hub_version: string;
  updated_at: string;
  files: Record<string, ManifestFile>;
}

interface FileStatus {
  fileName: string;
  description: string;
  critical: boolean;
  hubVersion: string;
  hardwareVersion: string | null;
  status: 'synced' | 'outdated' | 'missing' | 'unknown';
}

interface CodeSyncPanelProps {
  /** status_details do device (vem do banco via heartbeat) */
  statusDetails: Record<string, any> | null;
  deviceName: string;
}

// ─── Helpers ─────────────────────────────────────────────────────
function compareVersions(hub: string, hw: string): 'synced' | 'outdated' {
  return hub === hw ? 'synced' : 'outdated';
}

function StatusIcon({ status }: { status: FileStatus['status'] }) {
  if (status === 'synced')
    return <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-success" />;
  if (status === 'outdated')
    return <AlertTriangle className="w-4 h-4 flex-shrink-0 text-warning" />;
  if (status === 'missing')
    return <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />;
  return <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />;
}

function StatusBadge({ status }: { status: FileStatus['status'] }) {
  const map = {
    synced: 'text-success border-success bg-card',
    outdated: 'text-warning border-warning bg-card',
    missing: 'bg-destructive/10 text-destructive border-destructive/20',
    unknown: 'bg-muted text-muted-foreground border-border',
  };
  const labels = {
    synced: 'Sincronizado',
    outdated: 'Desatualizado',
    missing: 'Ausente',
    unknown: 'Sem dados',
  };
  return (
    <span
      className={cn(
        'text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide',
        map[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

// ─── Component ───────────────────────────────────────────────────
export function CodeSyncPanel({ statusDetails, deviceName }: CodeSyncPanelProps) {
  const [manifest, setManifest] = useState<HubManifest | null>(null);
  const [loadingManifest, setLoadingManifest] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchManifest = async () => {
    setLoadingManifest(true);
    try {
      // O manifest está servido como arquivo estático do Hub
      const res = await fetch('/totem-local/manifest.json?_=' + Date.now());
      if (res.ok) {
        const data: HubManifest = await res.json();
        setManifest(data);
      }
    } catch (err) {
      console.error('[CodeSync] Erro ao buscar manifest:', err);
    } finally {
      setLoadingManifest(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchManifest();
  }, []);

  // Versões reportadas pelo hardware via heartbeat
  const hardwareManifest: Record<string, string> | null =
    statusDetails?.code_manifest ?? null;

  const hasHeartbeatData = hardwareManifest !== null;

  // Computar status de cada arquivo
  const fileStatuses: FileStatus[] = manifest
    ? Object.entries(manifest.files).map(([fileName, info]) => {
        const hwVersion = hardwareManifest?.[fileName] ?? null;
        let status: FileStatus['status'] = 'unknown';
        if (!hasHeartbeatData) {
          status = 'unknown';
        } else if (!hwVersion) {
          status = 'missing';
        } else {
          status = compareVersions(info.version, hwVersion);
        }
        return {
          fileName,
          description: info.description,
          critical: info.critical,
          hubVersion: info.version,
          hardwareVersion: hwVersion,
          status,
        };
      })
    : [];

  const counts = {
    synced: fileStatuses.filter((f) => f.status === 'synced').length,
    outdated: fileStatuses.filter((f) => f.status === 'outdated').length,
    missing: fileStatuses.filter((f) => f.status === 'missing').length,
    unknown: fileStatuses.filter((f) => f.status === 'unknown').length,
  };

  const criticalIssues = fileStatuses.filter(
    (f) => f.critical && (f.status === 'outdated' || f.status === 'missing'),
  );

  return (
    <div className="space-y-4">
      {/* Header card */}
      <Card className="card-industrial">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-primary" />
              Sincronização de Código
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchManifest}
              disabled={loadingManifest}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', loadingManifest && 'animate-spin')} />
              <span className="ml-1 text-xs">Atualizar</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Resumo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Sincronizados', value: counts.synced, color: 'text-green-400' },
              { label: 'Desatualizados', value: counts.outdated, color: 'text-yellow-400' },
              { label: 'Ausentes', value: counts.missing, color: 'text-destructive' },
              { label: 'Sem dados', value: counts.unknown, color: 'text-muted-foreground' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-muted/40 rounded-lg p-2.5 text-center border border-border"
              >
                <p className={cn('text-xl font-bold', item.color)}>{item.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Alerta de problemas críticos */}
          {criticalIssues.length > 0 && (
            <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-destructive">
                  {criticalIssues.length} arquivo{criticalIssues.length > 1 ? 's' : ''} crítico
                  {criticalIssues.length > 1 ? 's' : ''} desatualizado
                  {criticalIssues.length > 1 ? 's' : ''}
                </p>
                <p className="text-muted-foreground mt-0.5">
                  Atualize o hardware "{deviceName}" para a versão mais recente do Hub.
                </p>
              </div>
            </div>
          )}

          {/* Info: sem heartbeat com manifest */}
          {!hasHeartbeatData && !loadingManifest && (
            <div className="flex items-start gap-2 bg-muted/40 border border-border rounded-lg p-3">
              <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                O hardware ainda não enviou dados de versão via heartbeat. Certifique-se de que o
                totem está online e usando{' '}
                <code className="text-foreground font-mono">App.jsx ≥ 3.0.0</code>.
              </p>
            </div>
          )}

          {/* Metadados do manifest */}
          {manifest && (
            <p className="text-[10px] text-muted-foreground">
              Manifest do Hub — versão{' '}
              <span className="font-mono text-foreground">{manifest.hub_version}</span> · Atualizado em{' '}
              <span className="font-mono text-foreground">{manifest.updated_at}</span> · Dados do hardware
              atualizados às{' '}
              <span className="font-mono text-foreground">
                {lastRefresh.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabela de arquivos */}
      <Card className="card-industrial">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground font-medium">
            Arquivos ({fileStatuses.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingManifest ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {fileStatuses.map((file) => (
                <div
                  key={file.fileName}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/20',
                    file.status === 'outdated' && 'bg-warning/5',
                    file.status === 'missing' && 'bg-destructive/5',
                  )}
                >
                  <StatusIcon status={file.status} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono text-foreground font-semibold">
                        {file.fileName}
                      </code>
                      {file.critical && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                          Crítico
                        </span>
                      )}
                      <StatusBadge status={file.status} />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {file.description}
                    </p>
                  </div>

                  {/* Versões */}
                  <div className="flex items-center gap-3 flex-shrink-0 text-right">
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Hub</p>
                      <code className="text-xs font-mono text-foreground">{file.hubVersion}</code>
                    </div>
                    {hasHeartbeatData && (
                      <>
                        <span className="text-muted-foreground/40 text-xs">→</span>
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Hardware</p>
                          <code
                            className={cn(
                              'text-xs font-mono',
                              file.status === 'synced' && 'text-success',
                              file.status === 'outdated' && 'text-warning',
                              file.status === 'missing' && 'text-destructive',
                            )}
                          >
                            {file.hardwareVersion ?? '—'}
                          </code>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Worker */}
      <Card className="card-industrial">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            Sync Worker Automático
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Rode o worker no hardware para sincronizar arquivos automaticamente sempre que o Hub for atualizado.
            Não requer nenhuma dependência extra — apenas Node.js.
          </p>

          {/* Passo 1 */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-foreground">1. Configure o .env no hardware</p>
            <div className="bg-muted rounded-md p-2.5 font-mono text-[11px] text-foreground space-y-0.5 border border-border">
              <p><span className="text-muted-foreground"># Copie .env.sync.example → .env e preencha:</span></p>
              <p>HUB_URL=<span className="text-primary">https://seu-hub.lovable.app</span></p>
              <p>SYNC_INTERVAL_MS=<span className="text-warning">30000</span></p>
              <p>RESTART_COMMAND=<span className="text-warning">pm2 restart totem</span></p>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-foreground">2. Inicie o worker</p>
            <div className="bg-muted rounded-md p-2.5 font-mono text-[11px] text-foreground border border-border">
              <p><span className="text-muted-foreground">$</span> node sync-worker.js</p>
            </div>
          </div>

          {/* Fluxo */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <p className="text-foreground font-semibold text-[11px] mb-1">Fluxo automático</p>
            <div className="flex items-start gap-1.5">
              <span className="text-primary font-bold">1.</span>
              <span>Você edita um arquivo em <code className="text-foreground">public/totem-local/</code> no Hub e incrementa a versão no <code className="text-foreground">manifest.json</code></span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-primary font-bold">2.</span>
              <span>O worker detecta a diferença de versão e baixa o arquivo atualizado direto do Hub</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-primary font-bold">3.</span>
              <span>Se o arquivo for crítico, o totem é reiniciado automaticamente via <code className="text-foreground">RESTART_COMMAND</code></span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-primary font-bold">4.</span>
              <span>O próximo heartbeat reporta as novas versões e o painel acima fica verde ✅</span>
            </div>
          </div>

          {/* Aviso backup */}
          <p className="text-[10px] text-muted-foreground">
            O worker mantém um backup <code className="font-mono">.bak</code> de cada arquivo antes de substituir (desative com <code className="font-mono">BACKUP_FILES=false</code>).
            Estado local salvo em <code className="font-mono">.sync-state.json</code>.
          </p>
        </CardContent>
      </Card>

      {/* Instruções manuais */}
      <Card className="card-industrial">
        <CardContent className="pt-4">
          <p className="text-xs font-semibold text-foreground mb-2">Atualização manual (sem o worker)</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>
              Edite os arquivos em{' '}
              <code className="text-foreground font-mono">public/totem-local/</code> no Hub
            </li>
            <li>
              Incremente a versão em{' '}
              <code className="text-foreground font-mono">manifest.json</code> e na constante{' '}
              <code className="text-foreground font-mono">LOCAL_FILE_VERSIONS</code> do <code className="text-foreground font-mono">App.jsx</code>
            </li>
            <li>Copie os arquivos modificados para o hardware e reinicie o totem</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

