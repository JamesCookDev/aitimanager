#!/usr/bin/env node
/**
 * ══════════════════════════════════════════════════════════════
 *  TOTEM AGENT  v9.0.0
 * ══════════════════════════════════════════════════════════════
 *
 *  Agente instalável para totems com provisionamento automático.
 *  Preparado para empacotamento como executável Windows (pkg/nexe).
 *
 *  Modos de operação:
 *    • Não provisionado → abre UI de ativação local
 *    • Provisionado     → opera normalmente (HTTP + sync + kiosk)
 *
 *  Estrutura de runtime:
 *    runtime/device.json   — credenciais do dispositivo
 *    runtime/config.json   — configuração operacional
 *    runtime/index.html    — conteúdo publicado
 *    runtime/logs/         — logs de operação
 *
 *  Uso:
 *    totem-agent.exe                  # Operação normal
 *    totem-agent.exe --no-kiosk       # Sem abrir navegador
 *    totem-agent.exe --reset          # Limpa provisionamento
 *
 * ══════════════════════════════════════════════════════════════
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');
const { exec, execSync, spawn } = require('child_process');
const os   = require('os');

// ─── Resolve base directory ──────────────────────────────────
// When packaged with pkg, process.execPath is the .exe location.
// __dirname points to the snapshot filesystem inside the binary.
// We need the *real* directory where the .exe lives for runtime/.
const BASE_DIR = process.pkg
  ? path.dirname(process.execPath)
  : path.resolve(__dirname, '..');

const AGENT_VERSION = '9.0.0';

// ─── Args ────────────────────────────────────────────────────
const ARGS = process.argv.slice(2);
const FLAG_NO_KIOSK = ARGS.includes('--no-kiosk');
const FLAG_RESET    = ARGS.includes('--reset');

// ─── Logging ─────────────────────────────────────────────────
let VERBOSE = false;
const log   = (msg) => console.log(`[Agent] ${msg}`);
const debug = (msg) => VERBOSE && console.log(`[Agent][debug] ${msg}`);
const warn  = (msg) => console.warn(`[Agent] ⚠️  ${msg}`);
const error = (msg) => console.error(`[Agent] ❌  ${msg}`);

// ═══════════════════════════════════════════════════════════════
//  MODULE: Runtime Storage
// ═══════════════════════════════════════════════════════════════
const RUNTIME_DIR  = path.join(BASE_DIR, 'runtime');
const DEVICE_FILE  = path.join(RUNTIME_DIR, 'device.json');
const CONFIG_FILE  = path.join(RUNTIME_DIR, 'config.json');
const HTML_FILE    = path.join(RUNTIME_DIR, 'index.html');
const LOGS_DIR     = path.join(RUNTIME_DIR, 'logs');

function ensureRuntimeDirs() {
  for (const dir of [RUNTIME_DIR, LOGS_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

function readJsonFile(filePath, fallback) {
  if (fallback === undefined) fallback = null;
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) { return fallback; }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function loadDeviceCredentials() {
  return readJsonFile(DEVICE_FILE, null);
}

function saveDeviceCredentials(creds) {
  writeJsonFile(DEVICE_FILE, {
    device_id: creds.device_id,
    api_key: creds.api_key,
    org_id: creds.org_id,
    org_name: creds.org_name || null,
    device_name: creds.device_name || null,
    provisioned_at: creds.provisioned_at || new Date().toISOString(),
    registration_method: creds.registration_method || 'enrollment',
  });
}

function loadOperationalConfig() {
  return readJsonFile(CONFIG_FILE, {
    sync_interval_ms: 15000,
    http_port: 8080,
    heartbeat_interval_ms: 30000,
    command_poll_interval_ms: 5000,
    kiosk_url: null,
    kiosk_delay_ms: 3000,
    kiosk_browser: 'auto',
    verbose: false,
  });
}

function saveOperationalConfig(config) {
  writeJsonFile(CONFIG_FILE, config);
}

function isProvisioned() {
  const creds = loadDeviceCredentials();
  // api_key is the minimum required credential; org_id is optional for legacy
  return creds && !!creds.api_key;
}

// ═══════════════════════════════════════════════════════════════
//  MODULE: Legacy .env Compatibility
// ═══════════════════════════════════════════════════════════════
function loadEnv() {
  const envPath = path.join(BASE_DIR, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = val;
  }
}

function migrateFromEnv() {
  loadEnv();

  const apiKey = process.env.API_KEY || process.env.TOTEM_API_KEY || process.env.VITE_TOTEM_API_KEY || process.env.VITE_API_KEY || '';
  const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  const deviceId = process.env.VITE_TOTEM_DEVICE_ID || process.env.TOTEM_DEVICE_ID || '';
  const orgId = process.env.VITE_ORG_ID || process.env.ORG_ID || '';

  if (!apiKey && !deviceId) return false;
  if (!supabaseUrl) return false;

  log('📦 Migrando configuração do .env para runtime/...');

  saveDeviceCredentials({
    device_id: deviceId || null,
    api_key: apiKey,
    org_id: orgId || null,
    provisioned_at: new Date().toISOString(),
    registration_method: 'legacy',
  });

  const config = loadOperationalConfig();
  config.supabase_url = supabaseUrl;
  config.anon_key = anonKey;
  config.http_port = parseInt(process.env.HTTP_PORT || '8080', 10);
  config.sync_interval_ms = parseInt(process.env.SYNC_INTERVAL_MS || '15000', 10);
  config.kiosk_delay_ms = parseInt(process.env.KIOSK_DELAY_MS || '3000', 10);
  config.kiosk_browser = process.env.KIOSK_BROWSER || 'auto';
  config.verbose = process.env.VERBOSE === 'true';
  saveOperationalConfig(config);

  log('✅ Migração concluída');
  return true;
}

// ═══════════════════════════════════════════════════════════════
//  MODULE: Platform Config
// ═══════════════════════════════════════════════════════════════
const EMBEDDED_CONFIG = {
  supabase_url: 'https://iwqcltmeniotzbowbxzg.supabase.co',
  anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3cWNsdG1lbmlvdHpib3dieHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQ0NDUsImV4cCI6MjA4NzAyMDQ0NX0.IxBMzeC6VUhe8lRE0yELuZM-4YdzgBo5dsCdddp1C_s',
};

function getSupabaseUrl() {
  const config = loadOperationalConfig();
  return config.supabase_url || EMBEDDED_CONFIG.supabase_url;
}

function getAnonKey() {
  const config = loadOperationalConfig();
  return config.anon_key || EMBEDDED_CONFIG.anon_key;
}

function getCmsApiUrl() {
  return getSupabaseUrl() + '/functions/v1';
}

function getApiKey() {
  const creds = loadDeviceCredentials();
  return creds ? creds.api_key || '' : '';
}

function getDeviceId() {
  const creds = loadDeviceCredentials();
  return creds ? creds.device_id || '' : '';
}

// ═══════════════════════════════════════════════════════════════
//  MODULE: Diagnostics
// ═══════════════════════════════════════════════════════════════
function getMachineFingerprint() {
  const nets = os.networkInterfaces();
  let mac = '';
  for (const ifaces of Object.values(nets)) {
    for (const iface of ifaces || []) {
      if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
        mac = iface.mac;
        break;
      }
    }
    if (mac) break;
  }
  const parts = [os.hostname(), os.platform(), os.arch(), mac || 'no-mac'];
  let hash = 0;
  const str = parts.join('-');
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return 'hw-' + Math.abs(hash).toString(36) + '-' + mac.replace(/:/g, '');
}

function getNetworkStatus() {
  const nets = os.networkInterfaces();
  for (const ifaces of Object.values(nets)) {
    for (const iface of ifaces || []) {
      if (!iface.internal && iface.family === 'IPv4') return 'connected';
    }
  }
  return 'disconnected';
}

function getStorageFreeMb() {
  try {
    if (process.platform === 'win32') {
      const out = execSync('wmic logicaldisk get size,freespace,caption', { timeout: 5000, encoding: 'utf8' });
      const lines = out.trim().split('\n').filter(function(l) { return l.trim(); });
      if (lines.length > 1) {
        const parts = lines[1].trim().split(/\s+/);
        if (parts.length >= 2) return Math.round(parseInt(parts[1]) / (1024 * 1024));
      }
    } else {
      const out = execSync("df -m / | tail -1 | awk '{print $4}'", { timeout: 5000, encoding: 'utf8' });
      return parseInt(out.trim()) || null;
    }
  } catch (_) { /* ignore */ }
  return null;
}

function collectTelemetry() {
  return {
    agent_version: AGENT_VERSION,
    worker_version: AGENT_VERSION,
    http_port: loadOperationalConfig().http_port || 8080,
    uptime_seconds: Math.floor(process.uptime()),
    hostname: os.hostname(),
    platform: os.platform() + '/' + os.arch(),
    network_status: getNetworkStatus(),
    kiosk_mode: !FLAG_NO_KIOSK,
    last_content_sync_at: lastHtmlSyncAt,
    last_sync_result: lastSyncResult,
    storage_free_mb: getStorageFreeMb(),
    node_version: process.version,
    packaged: !!process.pkg,
  };
}

// ═══════════════════════════════════════════════════════════════
//  MODULE: HTTP Client
// ═══════════════════════════════════════════════════════════════
function httpRequest(url, options) {
  return new Promise(function(resolve, reject) {
    const client = url.startsWith('https://') ? https : http;
    const req = client.request(url, Object.assign({ timeout: 15000 }, options), function(res) {
      let data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() { resolve({ status: res.statusCode, headers: res.headers, body: data }); });
    });
    req.on('error', reject);
    req.on('timeout', function() { req.destroy(); reject(new Error('Timeout')); });
    if (options.body) req.write(options.body);
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════
//  MODULE: Enrollment
// ═══════════════════════════════════════════════════════════════
async function enrollDevice(enrollmentKey) {
  const hardwareId = getMachineFingerprint();
  const apiUrl = getCmsApiUrl();

  log('🔑 Ativando dispositivo com chave: ' + enrollmentKey.substring(0, 8) + '...');
  log('🖥️  Hardware ID: ' + hardwareId);
  log('🌐 API URL: ' + apiUrl + '/totem-register');

  const payload = JSON.stringify({
    enrollment_key: enrollmentKey,
    hardware_id: hardwareId,
    name: 'Totem ' + os.hostname(),
    location: null,
    description: 'Auto-ativado em ' + os.hostname() + ' (' + os.platform() + ')',
  });

  const res = await httpRequest(apiUrl + '/totem-register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': getAnonKey(),
    },
    body: payload,
  });

  log('📨 Registro — HTTP ' + res.status);

  const result = JSON.parse(res.body);
  if (res.status >= 400) {
    error('Registro falhou: ' + (result.error || 'HTTP ' + res.status));
    throw new Error(result.error || 'HTTP ' + res.status);
  }

  if (!result.device || !result.device.id || !result.device.api_key) {
    error('Resposta inválida do servidor: ' + JSON.stringify(result));
    throw new Error('Resposta inválida do servidor — faltam device.id ou device.api_key');
  }

  const creds = {
    device_id: result.device.id,
    api_key: result.device.api_key,
    org_id: result.device.org_id || null,
    org_name: result.organization || null,
    device_name: result.device.name,
    registration_method: 'enrollment',
  };

  saveDeviceCredentials(creds);

  log('✅ Enrollment OK — device_id: ' + creds.device_id);
  log('✅ Enrollment OK — api_key: ' + creds.api_key.substring(0, 8) + '...');
  log('✅ Enrollment OK — org_id: ' + (creds.org_id || '(não informado)'));
  log('✅ Credenciais salvas em ' + DEVICE_FILE);

  return result;
}

// ═══════════════════════════════════════════════════════════════
//  MODULE: Activation UI
// ═══════════════════════════════════════════════════════════════
function getActivationHtml() {
  // Try to load external activation page first (allows customization)
  const externalPath = path.join(BASE_DIR, 'assets', 'activation.html');
  if (fs.existsSync(externalPath)) {
    return fs.readFileSync(externalPath, 'utf8');
  }

  return '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=1080, height=1920, initial-scale=1">\n  <title>Ativar Totem</title>\n  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    body {\n      width: 1080px; height: 1920px;\n      background: #0a0a0f;\n      font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif;\n      display: flex; align-items: center; justify-content: center;\n      color: #e2e8f0;\n    }\n    .container {\n      text-align: center; padding: 60px;\n      max-width: 800px;\n    }\n    .logo {\n      width: 80px; height: 80px;\n      background: linear-gradient(135deg, #6366f1, #8b5cf6);\n      border-radius: 24px;\n      margin: 0 auto 40px;\n      display: flex; align-items: center; justify-content: center;\n      font-size: 36px;\n    }\n    h1 { font-size: 48px; font-weight: 800; margin-bottom: 16px; }\n    .subtitle { font-size: 22px; color: #94a3b8; margin-bottom: 60px; line-height: 1.5; }\n    .input-group { margin-bottom: 30px; }\n    input {\n      width: 100%; padding: 24px 32px;\n      font-size: 28px; text-align: center;\n      background: #1e1e2e; border: 2px solid #334155;\n      border-radius: 16px; color: #e2e8f0;\n      font-family: monospace; letter-spacing: 4px;\n      outline: none; transition: border-color 0.2s;\n    }\n    input:focus { border-color: #6366f1; }\n    input::placeholder { color: #475569; letter-spacing: 2px; font-family: sans-serif; font-size: 22px; }\n    button {\n      width: 100%; padding: 24px;\n      font-size: 24px; font-weight: 700;\n      background: linear-gradient(135deg, #6366f1, #8b5cf6);\n      color: white; border: none; border-radius: 16px;\n      cursor: pointer; transition: opacity 0.2s;\n    }\n    button:hover { opacity: 0.9; }\n    button:disabled { opacity: 0.5; cursor: not-allowed; }\n    .status { margin-top: 30px; font-size: 20px; min-height: 30px; }\n    .status.error { color: #f87171; }\n    .status.success { color: #4ade80; }\n    .steps {\n      margin-top: 60px; text-align: left;\n      background: #1e1e2e; border-radius: 20px; padding: 40px;\n    }\n    .steps h3 { font-size: 22px; margin-bottom: 24px; color: #94a3b8; }\n    .step { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; }\n    .step-num {\n      width: 32px; height: 32px; border-radius: 50%;\n      background: #6366f1; color: white;\n      display: flex; align-items: center; justify-content: center;\n      font-weight: 700; font-size: 16px; flex-shrink: 0;\n    }\n    .step p { font-size: 18px; color: #cbd5e1; line-height: 1.5; }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <div class="logo">📡</div>\n    <h1>Ativar Totem</h1>\n    <p class="subtitle">\n      Informe o código de ativação da sua conta para<br>conectar este totem automaticamente.\n    </p>\n\n    <div class="input-group">\n      <input id="key" type="text" placeholder="Cole o código de ativação aqui" autocomplete="off" />\n    </div>\n    <button id="btn" onclick="activate()">Ativar</button>\n    <div id="status" class="status"></div>\n\n    <div class="steps">\n      <h3>Como funciona:</h3>\n      <div class="step">\n        <div class="step-num">1</div>\n        <p>Acesse o painel da sua conta e copie o <strong>código de ativação</strong></p>\n      </div>\n      <div class="step">\n        <div class="step-num">2</div>\n        <p>Cole o código no campo acima e clique em <strong>Ativar</strong></p>\n      </div>\n      <div class="step">\n        <div class="step-num">3</div>\n        <p>Pronto! O totem será configurado automaticamente em segundos</p>\n      </div>\n    </div>\n  </div>\n\n  <script>\n    async function activate() {\n      var key = document.getElementById(\'key\').value.trim();\n      var status = document.getElementById(\'status\');\n      var btn = document.getElementById(\'btn\');\n      if (!key) { status.textContent = \'Informe o código de ativação\'; status.className = \'status error\'; return; }\n      btn.disabled = true;\n      btn.textContent = \'Ativando...\';\n      status.textContent = \'Conectando ao servidor...\';\n      status.className = \'status\';\n      try {\n        var res = await fetch(\'/__totem_enroll\', {\n          method: \'POST\',\n          headers: { \'Content-Type\': \'application/json\' },\n          body: JSON.stringify({ enrollment_key: key }),\n        });\n        var data = await res.json();\n        if (data.success) {\n          status.textContent = \'✅ \' + (data.message || \'Totem ativado com sucesso!\');\n          status.className = \'status success\';\n          btn.textContent = \'Ativado!\';\n          setTimeout(function() { location.reload(); }, 3000);\n        } else {\n          throw new Error(data.error || \'Erro desconhecido\');\n        }\n      } catch (err) {\n        status.textContent = err.message;\n        status.className = \'status error\';\n        btn.disabled = false;\n        btn.textContent = \'Ativar\';\n      }\n    }\n    document.getElementById(\'key\').addEventListener(\'keydown\', function(e) { if (e.key === \'Enter\') activate(); });\n  </script>\n</body>\n</html>';
}

function getWaitingHtml() {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="10"></head><body style="width:1080px;height:1920px;margin:0;background:#0a0a0f;display:flex;align-items:center;justify-content:center;font-family:sans-serif;color:#94a3b8"><h1>Aguardando publicação...</h1></body></html>';
}

// ═══════════════════════════════════════════════════════════════
//  MODULE: Content Sync
// ═══════════════════════════════════════════════════════════════
let lastEtag = null;
let htmlRevision = Date.now();
let lastHtmlSyncAt = null;
let lastSyncResult = 'pending';

function markHtmlUpdated() {
  htmlRevision = Date.now();
  lastHtmlSyncAt = new Date().toISOString();
  lastSyncResult = 'success';
}

function injectAutoReloadScript(html) {
  const marker = '__TOTEM_AUTO_RELOAD__';
  if (html.includes(marker)) return html;
  const script = '\n<!-- ' + marker + ' -->\n<script>(function(){var last=null;async function check(){try{var r=await fetch(\'/__totem_version?ts=\'+Date.now(),{cache:\'no-store\'});var j=await r.json();if(last===null){last=j.revision;return;}if(j.revision!==last){window.location.reload();}}catch(e){} } setInterval(check,4000); check();})();<\/script>\n';
  if (html.includes('</body>')) return html.replace('</body>', script + '</body>');
  return html + script;
}

async function fetchHtml() {
  const apiUrl = getCmsApiUrl();
  const apiKey = getApiKey();
  const deviceId = getDeviceId();
  if (!apiKey && !deviceId) throw new Error('Dispositivo não provisionado');

  const url = apiUrl + '/totem-html';
  const headers = {
    'apikey': getAnonKey(),
    'Content-Type': 'application/json',
  };
  if (apiKey) headers['x-totem-api-key'] = apiKey;
  else headers['x-totem-device-id'] = deviceId;
  if (lastEtag) headers['If-None-Match'] = lastEtag;

  const res = await httpRequest(url, { method: 'GET', headers: headers });
  if (res.status === 304) return { html: null, changed: false };
  if (res.status >= 200 && res.status < 300) {
    if (res.headers.etag) lastEtag = res.headers.etag;
    return { html: res.body, changed: true };
  }
  throw new Error('HTTP ' + res.status + ': ' + res.body.substring(0, 200));
}

function updateHtmlFile(html) {
  const nextHtml = injectAutoReloadScript(html);
  try {
    if (fs.existsSync(HTML_FILE)) {
      const current = fs.readFileSync(HTML_FILE, 'utf8');
      if (current === nextHtml) { debug('HTML sem mudanças reais'); return; }
      fs.copyFileSync(HTML_FILE, HTML_FILE + '.bak');
    }
  } catch (_) { /* continue */ }
  fs.writeFileSync(HTML_FILE, nextHtml, 'utf8');
  markHtmlUpdated();
  log('✅ Conteúdo atualizado (' + (nextHtml.length / 1024).toFixed(1) + ' KB)');
}

async function syncContent() {
  try {
    const result = await fetchHtml();
    if (result.changed && result.html) {
      log('📥 Novo conteúdo — ' + (result.html.length / 1024).toFixed(1) + ' KB');
      updateHtmlFile(result.html);
    } else {
      debug('Sem alterações (304) | ' + new Date().toLocaleTimeString('pt-BR'));
    }
    lastSyncResult = 'success';
  } catch (err) {
    warn('Sync falhou: ' + err.message);
    lastSyncResult = 'error: ' + err.message;
  }
}

// ═══════════════════════════════════════════════════════════════
//  MODULE: Heartbeat
// ═══════════════════════════════════════════════════════════════
async function sendHeartbeat() {
  const apiKey = getApiKey();
  const deviceId = getDeviceId();
  const apiUrl = getCmsApiUrl();
  if (!apiKey && !deviceId) {
    warn('Heartbeat ignorado — sem credenciais');
    return;
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'apikey': getAnonKey(),
    };
    if (deviceId) headers['x-totem-device-id'] = deviceId;
    if (apiKey) headers['x-totem-api-key'] = apiKey;

    const telemetry = collectTelemetry();
    const payload = JSON.stringify({ status_details: telemetry });

    const res = await httpRequest(apiUrl + '/totem-heartbeat', {
      method: 'POST',
      headers: headers,
      body: payload,
    });

    if (res.status >= 200 && res.status < 300) {
      const data = JSON.parse(res.body);
      log('💓 Heartbeat OK — device: ' + (data.device_id || '?').substring(0, 8) + '… [' + new Date().toLocaleTimeString('pt-BR') + ']');

      // Process pending command from heartbeat response
      if (data.command) {
        log('⚡ Comando via heartbeat: "' + data.command + '"');
      }
    } else {
      warn('Heartbeat HTTP ' + res.status + ': ' + res.body.substring(0, 200));
      if (res.status === 404) {
        error('Heartbeat 404 — dispositivo não encontrado no backend. Verifique device_id/api_key.');
      } else if (res.status === 401) {
        error('Heartbeat 401 — falha de autenticação. apikey inválida?');
      }
    }
  } catch (err) {
    warn('Heartbeat falhou: ' + err.message);
  }
}

// ═══════════════════════════════════════════════════════════════
//  MODULE: Remote Commands
// ═══════════════════════════════════════════════════════════════
const EXIT_CODE_REMOTE_RESTART = 75;

async function checkRemoteCommand() {
  const apiKey = getApiKey();
  const deviceId = getDeviceId();
  const apiUrl = getCmsApiUrl();
  if (!apiKey && !deviceId) return null;

  try {
    const headers = {
      'apikey': getAnonKey(),
    };
    if (deviceId) headers['x-totem-device-id'] = deviceId;
    if (apiKey) headers['x-totem-api-key'] = apiKey;

    const res = await httpRequest(apiUrl + '/totem-poll-command', {
      method: 'GET',
      headers: headers,
    });
    const cmd = JSON.parse(res.body).command || null;
    if (cmd) log('📩 Comando recebido via poll: "' + cmd + '"');
    return cmd;
  } catch (err) {
    debug('Poll-command: ' + err.message);
    return null;
  }
}

async function reportCommandResult(command, status, errorMsg) {
  const apiKey = getApiKey();
  const apiUrl = getCmsApiUrl();
  if (!apiKey || !apiUrl) return;
  try {
    await httpRequest(apiUrl + '/totem-command-report', {
      method: 'POST',
      headers: { 'x-totem-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: command, status: status, error: errorMsg || undefined }),
    });
  } catch (err) {
    debug('Report falhou: ' + err.message);
  }
}

async function handleRemoteCommand() {
  const command = await checkRemoteCommand();
  if (!command) return;

  log('⚡ Comando: "' + command + '"');
  let success = true, errorMsg = null;

  try {
    switch (command) {
      case 'sync':
      case 'reload_config':
      case 'refresh_content':
        lastEtag = null;
        await syncContent();
        break;

      case 'refresh_config':
        break;

      case 'clear_cache':
        lastEtag = null;
        try { if (fs.existsSync(HTML_FILE + '.bak')) fs.unlinkSync(HTML_FILE + '.bak'); } catch (_) {}
        log('🧹 Cache limpo');
        break;

      case 'restart':
      case 'restart_browser':
        log('🔃 Reiniciando...');
        await reportCommandResult(command, 'executed', null);
        process.exit(EXIT_CODE_REMOTE_RESTART);
        return;

      case 're_enroll':
        log('🔄 Re-provisionamento solicitado...');
        if (fs.existsSync(DEVICE_FILE)) fs.unlinkSync(DEVICE_FILE);
        await reportCommandResult(command, 'executed', null);
        process.exit(EXIT_CODE_REMOTE_RESTART);
        return;

      case 'diagnostic_ping':
        log('📊 Diagnóstico solicitado');
        await sendHeartbeat();
        break;

      default:
        warn('Comando desconhecido: "' + command + '"');
        success = false;
        errorMsg = 'Comando desconhecido';
    }
  } catch (err) {
    error('"' + command + '" falhou: ' + err.message);
    success = false;
    errorMsg = err.message;
  }

  await reportCommandResult(command, success ? 'executed' : 'failed', errorMsg);
}

// ═══════════════════════════════════════════════════════════════
//  MODULE: HTTP Server
// ═══════════════════════════════════════════════════════════════
function startHttpServer(provisioned) {
  const config = loadOperationalConfig();
  const port = config.http_port || 8080;

  const server = http.createServer(async function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-cache');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        provisioned: isProvisioned(),
        timestamp: new Date().toISOString(),
      }));
      return;
    }

    if (req.url && req.url.indexOf('/__totem_version') === 0) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ revision: htmlRevision, etag: lastEtag, last_sync_at: lastHtmlSyncAt }));
      return;
    }

    if (req.url === '/__totem_enroll' && req.method === 'POST') {
      try {
        let body = '';
        for await (const chunk of req) body += chunk;
        const parsed = JSON.parse(body);
        const enrollment_key = parsed.enrollment_key;
        if (!enrollment_key) throw new Error('Código de ativação não informado');

        const result = await enrollDevice(enrollment_key);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: result.message || 'Totem ativado!' }));

        log('🔄 Reiniciando para modo operacional...');
        setTimeout(function() { process.exit(EXIT_CODE_REMOTE_RESTART); }, 2000);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return;
    }

    if (isProvisioned() && fs.existsSync(HTML_FILE)) {
      const html = fs.readFileSync(HTML_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } else if (!isProvisioned()) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getActivationHtml());
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getWaitingHtml());
    }
  });

  server.listen(port, function() {
    log('🌐 Servidor HTTP em http://localhost:' + port);
  });

  return server;
}

// ═══════════════════════════════════════════════════════════════
//  MODULE: Kiosk Launcher
// ═══════════════════════════════════════════════════════════════
function isCommandAvailable(cmd) {
  try { execSync(cmd + ' --version', { stdio: 'ignore', timeout: 5000 }); return true; }
  catch (_) { return false; }
}

function openKiosk() {
  if (FLAG_NO_KIOSK) return;

  const config = loadOperationalConfig();
  const port = config.http_port || 8080;
  const url = config.kiosk_url || ('http://localhost:' + port);
  const delay = config.kiosk_delay_ms || 3000;
  const browserPref = config.kiosk_browser || 'auto';

  log('🖥️  Abrindo kiosk em ' + (delay / 1000) + 's → ' + url);

  setTimeout(function() {
    const platform = process.platform;
    let browserCmd = null;
    const kioskFlags = '--kiosk --start-fullscreen --disable-infobars --disable-session-crashed-bubble --noerrdialogs --no-first-run --disable-translate --autoplay-policy=no-user-gesture-required';

    if (browserPref !== 'auto') {
      browserCmd = '"' + browserPref + '" ' + kioskFlags + ' "' + url + '"';
    } else if (platform === 'win32') {
      const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
      const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      if (fs.existsSync(edgePath)) browserCmd = '"' + edgePath + '" ' + kioskFlags + ' "' + url + '"';
      else if (fs.existsSync(chromePath)) browserCmd = '"' + chromePath + '" ' + kioskFlags + ' "' + url + '"';
      else browserCmd = 'msedge ' + kioskFlags + ' "' + url + '"';
    } else if (platform === 'linux') {
      if (isCommandAvailable('chromium-browser')) browserCmd = 'chromium-browser ' + kioskFlags + ' "' + url + '"';
      else if (isCommandAvailable('chromium')) browserCmd = 'chromium ' + kioskFlags + ' "' + url + '"';
      else if (isCommandAvailable('google-chrome')) browserCmd = 'google-chrome ' + kioskFlags + ' "' + url + '"';
      else browserCmd = 'xdg-open "' + url + '"';
    } else if (platform === 'darwin') {
      browserCmd = 'open -a "Google Chrome" --args --kiosk "' + url + '"';
    }

    if (browserCmd) {
      const browserProc = spawn(browserCmd, [], { shell: true, detached: true, stdio: 'ignore' });
      browserProc.unref();
      log('✅ Navegador kiosk aberto');
    } else {
      warn('Navegador não encontrado — abra manualmente: ' + url);
    }
  }, delay);
}

// ═══════════════════════════════════════════════════════════════
//  SUPERVISOR — auto-restart with crash protection
// ═══════════════════════════════════════════════════════════════
const MAX_RESTARTS   = 10;
const RESTART_WINDOW = 60000;
const RESTART_DELAY  = 5000;

if (process.env.__TOTEM_CHILD === 'true') {
  runWorker().catch(function(err) {
    error('Falha fatal: ' + err.message);
    process.exit(1);
  });
} else {
  const restartTimes = [];

  function spawnChild() {
    const childArgs = process.pkg
      ? ['--child', ...ARGS]
      : [__filename, ...ARGS];

    const child = spawn(process.execPath, childArgs, {
      stdio: 'inherit',
      env: Object.assign({}, process.env, { __TOTEM_CHILD: 'true' }),
    });

    child.on('exit', function(code) {
      if (code === 0) { log('Agent encerrado.'); process.exit(0); }
      if (code === EXIT_CODE_REMOTE_RESTART) {
        log('♻️ Reinício solicitado...');
        setTimeout(spawnChild, 1000);
        return;
      }
      const now = Date.now();
      restartTimes.push(now);
      while (restartTimes.length > 0 && restartTimes[0] < now - RESTART_WINDOW) restartTimes.shift();
      if (restartTimes.length >= MAX_RESTARTS) {
        error(MAX_RESTARTS + ' crashes em ' + (RESTART_WINDOW / 1000) + 's — abortando.');
        process.exit(1);
      }
      warn('Crash (código ' + code + '). Reiniciando em ' + (RESTART_DELAY / 1000) + 's... (' + restartTimes.length + '/' + MAX_RESTARTS + ')');
      setTimeout(spawnChild, RESTART_DELAY);
    });

    process.on('SIGINT',  function() { child.kill('SIGINT'); });
    process.on('SIGTERM', function() { child.kill('SIGTERM'); });
  }

  log('🛡️  Supervisor ativo');
  spawnChild();
}

// ═══════════════════════════════════════════════════════════════
//  MAIN WORKER
// ═══════════════════════════════════════════════════════════════
async function runWorker() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║         TOTEM AGENT  v' + AGENT_VERSION + '                      ║');
  console.log('║         Instalação e Operação Automática          ║');
  console.log('╚══════════════════════════════════════════════════╝');
  if (process.pkg) {
    console.log('║  📦 Executável empacotado                         ║');
    console.log('║  📂 Base: ' + BASE_DIR.substring(0, 38).padEnd(38) + ' ║');
  }
  console.log('');

  ensureRuntimeDirs();

  // Handle --reset
  if (FLAG_RESET) {
    log('🗑️  Limpando provisionamento...');
    if (fs.existsSync(DEVICE_FILE)) fs.unlinkSync(DEVICE_FILE);
    if (fs.existsSync(CONFIG_FILE)) fs.unlinkSync(CONFIG_FILE);
    log('✅ Provisionamento removido. Execute novamente para reativar.');
    return;
  }

  // Check provisioning
  if (!isProvisioned()) {
    log('🔍 Verificando .env legado...');
    const migrated = migrateFromEnv();
    if (!migrated) {
      log('');
      log('═══════════════════════════════════════════');
      log('  📡  MODO DE ATIVAÇÃO');
      log('  Este totem ainda não foi ativado.');
      log('  Abra o navegador para informar o código.');
      log('═══════════════════════════════════════════');
      log('');

      startHttpServer(false);
      openKiosk();
      return;
    }
  }

  // ── Provisioned Mode ─────────────────────────────────────────
  const creds = loadDeviceCredentials();
  const config = loadOperationalConfig();
  VERBOSE = config.verbose || false;

  log('📱 Dispositivo: ' + (creds.device_name || creds.device_id || '(sem nome)'));
  log('🏢 Organização: ' + (creds.org_name || creds.org_id || '(desconhecida)'));
  log('🌐 Porta HTTP : ' + (config.http_port || 8080));
  log('🔄 Intervalo  : ' + ((config.sync_interval_ms || 15000) / 1000) + 's');
  log('🖥️  Kiosk      : ' + (FLAG_NO_KIOSK ? 'desativado' : 'ativo'));
  console.log('');

  // Initial content sync
  log('━━━ Buscando conteúdo publicado ━━━');
  try {
    const result = await fetchHtml();
    if (result.changed && result.html) {
      updateHtmlFile(result.html);
    } else {
      log('ℹ️  Nenhum conteúdo publicado ainda');
    }
  } catch (err) {
    warn('Fetch inicial falhou: ' + err.message);
    if (!fs.existsSync(HTML_FILE)) {
      fs.writeFileSync(HTML_FILE, getWaitingHtml(), 'utf8');
    }
  }

  // Start services
  startHttpServer(true);
  openKiosk();

  // Heartbeat
  log('💓 Heartbeat ativo');
  await sendHeartbeat();
  const heartbeatInterval = setInterval(sendHeartbeat, config.heartbeat_interval_ms || 30000);

  // Content polling
  log('━━━ Polling de conteúdo ativo ━━━');
  const pollInterval = setInterval(syncContent, config.sync_interval_ms || 15000);

  // Remote commands
  const apiKey = getApiKey();
  let cmdInterval;
  if (apiKey) {
    log('🔌 Polling de comandos remotos ativo');
    cmdInterval = setInterval(handleRemoteCommand, config.command_poll_interval_ms || 5000);
  }

  // Graceful shutdown
  function shutdown() {
    log('Encerrando...');
    clearInterval(heartbeatInterval);
    clearInterval(pollInterval);
    if (cmdInterval) clearInterval(cmdInterval);
    setTimeout(function() { process.exit(0); }, 500);
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
