#!/usr/bin/env node
/**
 * ══════════════════════════════════════════════════════════════
 *  TOTEM SYNC WORKER  —  sync-worker.js
 * ══════════════════════════════════════════════════════════════
 *
 *  Roda no hardware local, independente do processo do totem.
 *  Monitora o manifest.json do Hub e sincroniza automaticamente
 *  os arquivos de public/totem-local/ sempre que houver novidades.
 *
 *  Uso:
 *    node sync-worker.js
 *
 *  Variáveis de ambiente (.env ou export):
 *    HUB_URL          URL base do Hub publicado  (obrigatório)
 *                     Ex: https://meu-totem.lovable.app
 *    LOCAL_DIR        Caminho da pasta local do totem
 *                     Padrão: diretório onde sync-worker.js está
 *    SYNC_INTERVAL_MS Intervalo de verificação em ms  (padrão: 30000)
 *    RESTART_COMMAND  Comando para reiniciar o totem após atualização
 *                     Ex: "pm2 restart totem"  ou  "npm run dev"
 *                     Se não configurado, apenas avisa no console.
 *    BACKUP_FILES     "true" para manter .bak dos arquivos antigos (padrão: true)
 *    VERBOSE          "true" para logs detalhados (padrão: false)
 *
 * ══════════════════════════════════════════════════════════════
 */

'use strict';

const fs          = require('fs');
const path        = require('path');
const https       = require('https');
const http        = require('http');
const { exec }    = require('child_process');

// ─── Carregar .env manualmente (sem dependência de dotenv) ───
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && rest.length > 0) {
      process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

// ─── Configuração ────────────────────────────────────────────
const HUB_URL          = (process.env.HUB_URL || '').replace(/\/$/, '');
const LOCAL_DIR        = process.env.LOCAL_DIR || __dirname;
const SYNC_INTERVAL    = parseInt(process.env.SYNC_INTERVAL_MS || '30000', 10);
const RESTART_COMMAND  = process.env.RESTART_COMMAND || null;
const BACKUP_FILES     = process.env.BACKUP_FILES !== 'false';
const VERBOSE          = process.env.VERBOSE === 'true';
const API_KEY          = process.env.API_KEY || null;          // mesma chave usada pelo App.jsx
const SUPABASE_URL     = (process.env.SUPABASE_URL || '').replace(/\/$/, '');

// Arquivo local que guarda as versões já instaladas no hardware
const LOCAL_STATE_PATH = path.join(LOCAL_DIR, '.sync-state.json');

// ─── Utilidades ──────────────────────────────────────────────
const log   = (msg)  => console.log(`[Sync] ${msg}`);
const debug = (msg)  => VERBOSE && console.log(`[Sync][debug] ${msg}`);
const warn  = (msg)  => console.warn(`[Sync] ⚠️  ${msg}`);
const error = (msg)  => console.error(`[Sync] ❌  ${msg}`);

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : http;
    const req = client.get(url, { timeout: 10_000 }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`HTTP ${res.statusCode} ao buscar ${url}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout ao buscar ${url}`)); });
  });
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_STATE_PATH, 'utf8'));
  } catch {
    return { files: {}, last_sync: null };
  }
}

function saveState(state) {
  fs.writeFileSync(LOCAL_STATE_PATH, JSON.stringify({ ...state, last_sync: new Date().toISOString() }, null, 2));
}

function backupFile(filePath) {
  if (!BACKUP_FILES) return;
  if (fs.existsSync(filePath)) {
    const bakPath = filePath + '.bak';
    fs.copyFileSync(filePath, bakPath);
    debug(`Backup criado: ${path.basename(bakPath)}`);
  }
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function triggerRestart() {
  if (!RESTART_COMMAND) {
    warn('Arquivos críticos atualizados — reinicie o totem manualmente (ou configure RESTART_COMMAND no .env)');
    return;
  }
  log(`🔃 Reiniciando totem: ${RESTART_COMMAND}`);
  exec(RESTART_COMMAND, (err, stdout, stderr) => {
    if (err) {
      error(`Falha ao reiniciar: ${err.message}`);
    } else {
      log('✅ Reinicialização disparada com sucesso');
      if (stdout) debug(stdout.trim());
    }
  });
}

// ─── Verificar comando remoto via heartbeat ───────────────────
// Se API_KEY e SUPABASE_URL estiverem configurados, o worker faz um
// heartbeat próprio para buscar comandos pendentes (ex: 'sync').
async function checkRemoteCommand() {
  if (!API_KEY || !SUPABASE_URL) return null;

  try {
    const url   = `${SUPABASE_URL}/functions/v1/totem-heartbeat`;
    const body  = JSON.stringify({
      is_speaking: false,
      status_details: { worker: true, uptime: Math.floor(process.uptime()) },
    });

    const text = await new Promise((resolve, reject) => {
      const client = url.startsWith('https://') ? https : http;
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-totem-api-key': API_KEY,
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 10_000,
      };
      const req = client.request(url, options, (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout heartbeat')); });
      req.write(body);
      req.end();
    });

    const json = JSON.parse(text);
    return json.command || null;
  } catch (err) {
    debug(`Heartbeat do worker falhou: ${err.message}`);
    return null;
  }
}

// ─── Loop principal ──────────────────────────────────────────
async function syncFiles() {
  if (!HUB_URL) {
    error('HUB_URL não configurado! Defina no .env ou via variável de ambiente.');
    return;
  }

  debug(`Verificando Hub: ${HUB_URL}/totem-local/manifest.json`);

  let hubManifest;
  try {
    const text = await fetchText(`${HUB_URL}/totem-local/manifest.json`);
    hubManifest = JSON.parse(text);
  } catch (err) {
    error(`Não foi possível buscar o manifest: ${err.message}`);
    return;
  }

  const state = loadState();
  const updatedFiles  = [];
  let   hasCritical   = false;

  for (const [fileName, fileInfo] of Object.entries(hubManifest.files || {})) {
    const installedVersion = state.files[fileName]?.version;
    const hubVersion       = fileInfo.version;

    if (installedVersion === hubVersion) {
      debug(`${fileName} — OK (${hubVersion})`);
      continue;
    }

    const action = installedVersion ? `${installedVersion} → ${hubVersion}` : `novo (${hubVersion})`;
    log(`📥 Atualizando ${fileName}  [${action}]`);

    try {
      const content  = await fetchText(`${HUB_URL}/totem-local/${fileName}`);
      const localPath = path.join(LOCAL_DIR, fileName);

      ensureDir(localPath);
      backupFile(localPath);
      fs.writeFileSync(localPath, content, 'utf8');

      // Atualiza estado local
      if (!state.files) state.files = {};
      state.files[fileName] = { version: hubVersion, updated_at: new Date().toISOString() };

      updatedFiles.push(fileName);
      if (fileInfo.critical) hasCritical = true;

      log(`✅ ${fileName} atualizado`);
    } catch (err) {
      error(`Falha ao atualizar ${fileName}: ${err.message}`);
    }
  }

  // Persiste o novo estado mesmo se alguns arquivos falharam
  saveState(state);

  if (updatedFiles.length === 0) {
    log(`✔ Tudo sincronizado  [${new Date().toLocaleTimeString('pt-BR')}]`);
  } else {
    log(`🔄 ${updatedFiles.length} arquivo(s) sincronizado(s): ${updatedFiles.join(', ')}`);
    if (hasCritical) triggerRestart();
  }
}

// ─── Graceful shutdown ───────────────────────────────────────
let intervalId;

function shutdown() {
  log('Worker encerrado.');
  clearInterval(intervalId);
  process.exit(0);
}
process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);

// ─── Bootstrap ───────────────────────────────────────────────
console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║         TOTEM SYNC WORKER  v1.0.0           ║');
console.log('╚══════════════════════════════════════════════╝');
log(`Hub URL       : ${HUB_URL || '(não configurado!)'}`);
log(`Diretório     : ${LOCAL_DIR}`);
log(`Intervalo     : ${SYNC_INTERVAL / 1000}s`);
log(`Restart cmd   : ${RESTART_COMMAND || '(nenhum — reinicie manualmente)'}`);
log(`Backups       : ${BACKUP_FILES ? 'ativados' : 'desativados'}`);
log(`Cmd remoto    : ${API_KEY ? 'ativado (API_KEY + SUPABASE_URL configurados)' : 'desativado (API_KEY não configurado)'}`);
console.log('');

// Verificação de comandos remotos a cada 5s (separada do sync de arquivos)
async function checkLoop() {
  const command = await checkRemoteCommand();
  if (command === 'sync') {
    log('⚡ Comando "sync" recebido do Hub — sincronizando imediatamente...');
    await syncFiles();
  }
}

// Primeira execução imediata, depois em loop
syncFiles();
intervalId = setInterval(syncFiles, SYNC_INTERVAL);

// Loop de verificação de comandos (só ativo se API_KEY configurado)
if (API_KEY && SUPABASE_URL) {
  log('🔌 Polling de comandos remotos ativo (a cada 5s)');
  setInterval(checkLoop, 5000);
}
