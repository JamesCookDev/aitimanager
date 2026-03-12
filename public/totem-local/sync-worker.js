#!/usr/bin/env node
/**
 * ══════════════════════════════════════════════════════════════
 *  TOTEM WORKER  —  sync-worker.js  v6.0.0
 * ══════════════════════════════════════════════════════════════
 *
 *  Servidor HTTP local + atualizador de HTML para totems.
 *
 *  Fluxo:
 *  1. Carrega .env e valida configurações
 *  2. Busca o HTML publicado via Edge Function (totem-html)
 *  3. Salva como index.html local
 *  4. Serve via HTTP server (porta 8080)
 *  5. Polling periódico por atualizações (ETag-based)
 *  6. Abre navegador em modo kiosk
 *  7. Escuta comandos remotos
 *
 *  Uso:
 *    node sync-worker.js              # Servidor + polling + kiosk
 *    node sync-worker.js --no-kiosk   # Sem abrir navegador
 *    node sync-worker.js --setup      # Apenas setup inicial
 *
 *  Variáveis de ambiente (.env):
 *    VITE_CMS_API_URL      — URL das Edge Functions
 *    VITE_SUPABASE_ANON_KEY — Anon key do projeto
 *    VITE_SUPABASE_URL     — URL base do Supabase (para Realtime)
 *    VITE_TOTEM_DEVICE_ID  — ID do dispositivo (ou usa API key)
 *    API_KEY               — API key do dispositivo
 *    SYNC_INTERVAL_MS      — Intervalo de polling (padrão: 15000)
 *    HTTP_PORT             — Porta do servidor HTTP (padrão: 8080)
 *    KIOSK_URL             — URL do kiosk (padrão: http://localhost:8080)
 *    KIOSK_DELAY_MS        — Delay antes de abrir navegador
 *    KIOSK_BROWSER         — Caminho do navegador (auto-detecta)
 *
 * ══════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { exec, execSync, spawn } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Args ────────────────────────────────────────────────────
const ARGS = process.argv.slice(2);
const FLAG_SETUP    = ARGS.includes('--setup');
const FLAG_NO_KIOSK = ARGS.includes('--no-kiosk');

// ─── Carregar .env manualmente ───────────────────────────────
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

// ─── Utilidades ──────────────────────────────────────────────
const log   = (msg) => console.log(`[Totem] ${msg}`);
const debug = (msg) => VERBOSE && console.log(`[Totem][debug] ${msg}`);
const warn  = (msg) => console.warn(`[Totem] ⚠️  ${msg}`);
const error = (msg) => console.error(`[Totem] ❌  ${msg}`);

let VERBOSE = false;

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); });
  });
}

function isCommandAvailable(cmd) {
  try { execSync(`${cmd} --version`, { stdio: 'ignore', timeout: 5000 }); return true; }
  catch { return false; }
}

// ─── Configurações (lazy) ────────────────────────────────────
function ANON_KEY() {
  return (
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    ''
  );
}

function SUPABASE_URL() {
  const direct = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
  if (direct) return direct;
  const projectId = process.env.VITE_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID || '';
  return projectId ? `https://${projectId}.supabase.co` : '';
}

// Derive CMS API from explicit URL or project base URL
function CMS_API_URL() {
  const explicit = (process.env.VITE_CMS_API_URL || process.env.CMS_API_URL || '').replace(/\/$/, '');
  if (explicit) return explicit;
  const base = SUPABASE_URL();
  return base ? `${base}/functions/v1` : '';
}

function DEVICE_ID() { return process.env.VITE_TOTEM_DEVICE_ID || process.env.TOTEM_DEVICE_ID || ''; }
function API_KEY() {
  return (
    process.env.API_KEY ||
    process.env.TOTEM_API_KEY ||
    process.env.VITE_TOTEM_API_KEY ||
    process.env.VITE_API_KEY ||
    ''
  );
}
function SYNC_INTERVAL()   { return parseInt(process.env.SYNC_INTERVAL_MS || '15000', 10); }
function HTTP_PORT()       { return parseInt(process.env.HTTP_PORT || '8080', 10); }
function KIOSK_URL()       { return process.env.KIOSK_URL || `http://localhost:${HTTP_PORT()}`; }
function KIOSK_DELAY()     { return parseInt(process.env.KIOSK_DELAY_MS || '3000', 10); }
function KIOSK_BROWSER()   { return process.env.KIOSK_BROWSER || 'auto'; }

const HTML_FILE = () => path.join(__dirname, 'index.html');

function validateRuntimeConfig() {
  const apiUrl = CMS_API_URL();
  const hasIdentity = Boolean(API_KEY() || DEVICE_ID());

  if (!apiUrl) {
    error('Config inválida: defina VITE_CMS_API_URL, VITE_SUPABASE_URL ou VITE_SUPABASE_PROJECT_ID no .env');
    return false;
  }

  if (!hasIdentity) {
    error('Config inválida: defina API_KEY (ou VITE_TOTEM_DEVICE_ID) no .env');
    return false;
  }

  if (!ANON_KEY()) {
    warn('VITE_SUPABASE_ANON_KEY não encontrada (algumas funções podem falhar)');
  }

  return true;
}

// ─── Garantir .env existe ────────────────────────────────────
async function ensureEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    log('✅ .env encontrado');
    return;
  }

  const examplePath = path.join(__dirname, '.env.sync.example');
  if (!fs.existsSync(examplePath)) {
    error('.env não encontrado! Crie um .env com as configurações necessárias.');
    process.exit(1);
  }

  log('📄 Criando .env a partir de .env.sync.example...');
  let content = fs.readFileSync(examplePath, 'utf8');

  const orgId = await ask('\n📋 Cole o UUID da organização: ');
  if (orgId && orgId.length > 10) {
    content = content.replace('cole-o-uuid-da-organizacao-aqui', orgId);
  } else {
    error('ORG_ID inválido.');
    process.exit(1);
  }

  fs.writeFileSync(envPath, content, 'utf8');
  log('✅ .env criado');
}

// ══════════════════════════════════════════════════════════════
//  FETCH HTML — busca o HTML publicado via Edge Function
// ══════════════════════════════════════════════════════════════
let lastEtag = null;
let htmlRevision = Date.now();
let lastHtmlSyncAt = null;

function markHtmlUpdated() {
  htmlRevision = Date.now();
  lastHtmlSyncAt = new Date().toISOString();
}

function injectAutoReloadScript(html) {
  const marker = '__TOTEM_AUTO_RELOAD__';
  if (html.includes(marker)) return html;

  const script = `\n<!-- ${marker} -->\n<script>(function(){var last=null;async function check(){try{var r=await fetch('/__totem_version?ts='+Date.now(),{cache:'no-store'});var j=await r.json();if(last===null){last=j.revision;return;}if(j.revision!==last){window.location.reload();}}catch(e){} } setInterval(check,4000); check();})();</script>\n`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${script}</body>`);
  }

  return `${html}${script}`;
}

function fetchHtml() {
  return new Promise((resolve, reject) => {
    const apiUrl = CMS_API_URL();
    if (!apiUrl) { reject(new Error('VITE_CMS_API_URL não configurado')); return; }

    const url = `${apiUrl}/totem-html`;
    const headers = {
      'apikey': ANON_KEY(),
      'Content-Type': 'application/json',
    };

    // Identify device
    if (API_KEY()) headers['x-totem-api-key'] = API_KEY();
    else if (DEVICE_ID()) headers['x-totem-device-id'] = DEVICE_ID();
    else { reject(new Error('Defina API_KEY ou VITE_TOTEM_DEVICE_ID no .env')); return; }

    // ETag for caching
    if (lastEtag) headers['If-None-Match'] = lastEtag;

    const client = url.startsWith('https://') ? https : http;
    const req = client.get(url, { headers, timeout: 15000 }, (res) => {
      if (res.statusCode === 304) {
        resolve({ html: null, changed: false });
        return;
      }

      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.headers.etag) lastEtag = res.headers.etag;
          resolve({ html: body, changed: true });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ══════════════════════════════════════════════════════════════
//  UPDATE HTML — salva o HTML no arquivo local
// ══════════════════════════════════════════════════════════════
function updateHtmlFile(html) {
  const htmlPath = HTML_FILE();
  const nextHtml = injectAutoReloadScript(html);

  try {
    if (fs.existsSync(htmlPath)) {
      const currentHtml = fs.readFileSync(htmlPath, 'utf8');
      if (currentHtml === nextHtml) {
        debug('HTML recebido sem mudanças reais no arquivo local');
        return;
      }
      fs.copyFileSync(htmlPath, htmlPath + '.bak');
    }
  } catch {
    // segue o fluxo mesmo se não conseguir comparar/backup
  }

  fs.writeFileSync(htmlPath, nextHtml, 'utf8');
  markHtmlUpdated();
  log(`✅ HTML atualizado (${(nextHtml.length / 1024).toFixed(1)} KB)`);
}

// ══════════════════════════════════════════════════════════════
//  HTTP SERVER — serve o index.html localmente
// ══════════════════════════════════════════════════════════════
function startHttpServer() {
  const port = HTTP_PORT();

  const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'no-cache');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    // Health check endpoint
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    // Serve index.html for everything else
    const htmlPath = HTML_FILE();
    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="width:1080px;height:1920px;margin:0;background:#0f172a;display:flex;align-items:center;justify-content:center;font-family:sans-serif;color:#94a3b8"><h1>Aguardando publicação...</h1></body></html>`);
    }
  });

  server.listen(port, () => {
    log(`🌐 Servidor HTTP em http://localhost:${port}`);
  });

  return server;
}

// ══════════════════════════════════════════════════════════════
//  POLLING — verifica atualizações periodicamente
// ══════════════════════════════════════════════════════════════
async function pollForUpdates() {
  try {
    const result = await fetchHtml();
    if (result.changed && result.html) {
      updateHtmlFile(result.html);
    } else {
      debug(`Sem alterações [${new Date().toLocaleTimeString('pt-BR')}]`);
    }
  } catch (err) {
    warn(`Polling falhou: ${err.message}`);
  }
}

// ══════════════════════════════════════════════════════════════
//  HEARTBEAT — informa ao Hub que o totem está online
// ══════════════════════════════════════════════════════════════
async function sendHeartbeat() {
  const apiKey = API_KEY();
  const deviceId = DEVICE_ID();
  const apiUrl = CMS_API_URL();
  if (!apiUrl) { debug('Heartbeat: CMS_API_URL não configurado'); return; }
  if (!apiKey && !deviceId) { debug('Heartbeat: sem identificação'); return; }

  try {
    const url = `${apiUrl}/totem-heartbeat`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY(),
    };
    if (apiKey) headers['x-totem-api-key'] = apiKey;
    else headers['x-totem-device-id'] = deviceId;

    const payload = JSON.stringify({
      status_details: {
        worker_version: '7.0.0',
        http_port: HTTP_PORT(),
        uptime_seconds: Math.floor(process.uptime()),
      }
    });

    await new Promise((resolve, reject) => {
      const client = url.startsWith('https://') ? https : http;
      const req = client.request(url, {
        method: 'POST',
        headers,
        timeout: 10000,
      }, (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            debug(`Heartbeat OK [${new Date().toLocaleTimeString('pt-BR')}]`);
          } else {
            warn(`Heartbeat HTTP ${res.statusCode}: ${data.substring(0, 100)}`);
          }
          resolve(data);
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
      req.write(payload);
      req.end();
    });
  } catch (err) {
    warn(`Heartbeat falhou: ${err.message}`);
  }
}

// ══════════════════════════════════════════════════════════════
//  REALTIME — escuta atualizações via Supabase Realtime
// ══════════════════════════════════════════════════════════════
// Note: Realtime via WebSocket requires a browser-like env.
// The worker uses simple polling as primary mechanism.

// ══════════════════════════════════════════════════════════════
//  KIOSK — abrir navegador em tela cheia
// ══════════════════════════════════════════════════════════════
function openKiosk() {
  if (FLAG_SETUP || FLAG_NO_KIOSK) return;

  const url = KIOSK_URL();
  const delay = KIOSK_DELAY();
  const browserPref = KIOSK_BROWSER();

  log(`🖥️  Abrindo kiosk em ${delay / 1000}s → ${url}`);

  setTimeout(() => {
    const platform = process.platform;
    let browserCmd = null;
    const kioskFlags = '--kiosk --start-fullscreen --disable-infobars --disable-session-crashed-bubble --noerrdialogs --no-first-run --disable-translate --autoplay-policy=no-user-gesture-required';

    if (browserPref !== 'auto') {
      browserCmd = `"${browserPref}" ${kioskFlags} "${url}"`;
    } else if (platform === 'win32') {
      const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
      const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      if (fs.existsSync(edgePath)) browserCmd = `"${edgePath}" ${kioskFlags} "${url}"`;
      else if (fs.existsSync(chromePath)) browserCmd = `"${chromePath}" ${kioskFlags} "${url}"`;
      else browserCmd = `msedge ${kioskFlags} "${url}"`;
    } else if (platform === 'linux') {
      if (isCommandAvailable('chromium-browser')) browserCmd = `chromium-browser ${kioskFlags} "${url}"`;
      else if (isCommandAvailable('chromium')) browserCmd = `chromium ${kioskFlags} "${url}"`;
      else if (isCommandAvailable('google-chrome')) browserCmd = `google-chrome ${kioskFlags} "${url}"`;
      else browserCmd = `xdg-open "${url}"`;
    } else if (platform === 'darwin') {
      browserCmd = `open -a "Google Chrome" --args --kiosk "${url}"`;
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

// ══════════════════════════════════════════════════════════════
//  COMANDOS REMOTOS — polling de comandos do Hub
// ══════════════════════════════════════════════════════════════
async function checkRemoteCommand() {
  const apiKey = API_KEY();
  const apiUrl = CMS_API_URL();
  if (!apiKey || !apiUrl) return null;

  try {
    const url = `${apiUrl}/totem-poll-command`;
    const text = await new Promise((resolve, reject) => {
      const client = url.startsWith('https://') ? https : http;
      const req = client.request(url, {
        method: 'GET',
        headers: { 'x-totem-api-key': apiKey },
        timeout: 10000,
      }, (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
      req.end();
    });
    return JSON.parse(text).command || null;
  } catch (err) {
    debug(`Poll-command: ${err.message}`);
    return null;
  }
}

async function reportCommandResult(command, status, errorMsg) {
  const apiKey = API_KEY();
  const apiUrl = CMS_API_URL();
  if (!apiKey || !apiUrl) return;
  try {
    const url = `${apiUrl}/totem-command-report`;
    const payload = JSON.stringify({ command, status, error: errorMsg || undefined });
    await new Promise((resolve, reject) => {
      const client = url.startsWith('https://') ? https : http;
      const req = client.request(url, {
        method: 'POST',
        headers: { 'x-totem-api-key': apiKey, 'Content-Type': 'application/json' },
        timeout: 10000,
      }, (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
      req.write(payload);
      req.end();
    });
  } catch (err) {
    debug(`Report falhou: ${err.message}`);
  }
}

async function handleRemoteCommand() {
  const command = await checkRemoteCommand();
  if (!command) return;

  log(`⚡ Comando: "${command}"`);
  let success = true, errorMsg = null;

  try {
    switch (command) {
      case 'sync':
      case 'reload_config':
        // Force HTML refresh (clear ETag to force download)
        lastEtag = null;
        await pollForUpdates();
        break;
      case 'restart':
        log('🔃 Reiniciando por comando remoto...');
        await reportCommandResult(command, 'executed', null);
        process.exit(EXIT_CODE_REMOTE_RESTART);
        return;
      default:
        warn(`Comando desconhecido: "${command}"`);
        success = false;
        errorMsg = 'Comando desconhecido';
    }
  } catch (err) {
    error(`"${command}" falhou: ${err.message}`);
    success = false;
    errorMsg = err.message;
  }

  await reportCommandResult(command, success ? 'executed' : 'failed', errorMsg);
}

// ══════════════════════════════════════════════════════════════
//  AUTO-RESTART — respawna o processo em caso de erro fatal
// ══════════════════════════════════════════════════════════════
const MAX_RESTARTS   = 10;
const RESTART_WINDOW = 60000; // 1 minuto
const RESTART_DELAY  = 5000;  // 5 segundos entre restarts
const EXIT_CODE_REMOTE_RESTART = 75;

if (process.env.__TOTEM_CHILD === 'true') {
  // ── Processo filho — executa o worker de verdade ──────────
  runWorker().catch((err) => {
    error(`Falha fatal: ${err.message}`);
    process.exit(1);
  });
} else {
  // ── Processo pai — supervisiona e reinicia ────────────────
  const restartTimes = [];

  function spawnChild() {
    const child = spawn(process.execPath, [__filename, ...ARGS], {
      stdio: 'inherit',
      env: { ...process.env, __TOTEM_CHILD: 'true' },
    });

    child.on('exit', (code) => {
      if (code === 0) {
        log('Worker encerrado normalmente.');
        process.exit(0);
      }

      if (code === EXIT_CODE_REMOTE_RESTART) {
        log('♻️ Reinício remoto solicitado — iniciando novo processo...');
        setTimeout(spawnChild, 1000);
        return;
      }

      const now = Date.now();
      restartTimes.push(now);
      // Manter apenas restarts dentro da janela
      while (restartTimes.length > 0 && restartTimes[0] < now - RESTART_WINDOW) {
        restartTimes.shift();
      }

      if (restartTimes.length >= MAX_RESTARTS) {
        error(`${MAX_RESTARTS} crashes em menos de ${RESTART_WINDOW / 1000}s — abortando.`);
        process.exit(1);
      }

      warn(`Worker crashou (código ${code}). Reiniciando em ${RESTART_DELAY / 1000}s... (${restartTimes.length}/${MAX_RESTARTS})`);
      setTimeout(spawnChild, RESTART_DELAY);
    });

    // Repassar sinais para o filho
    process.on('SIGINT',  () => child.kill('SIGINT'));
    process.on('SIGTERM', () => child.kill('SIGTERM'));
  }

  log('🛡️  Supervisor ativo — auto-restart habilitado');
  spawnChild();
}

// ══════════════════════════════════════════════════════════════
//  WORKER — lógica principal
// ══════════════════════════════════════════════════════════════
async function runWorker() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║         TOTEM WORKER  v7.0.0                     ║');
  console.log('║         HTTP Server + HTML Updater + Auto-Restart ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');

  // Setup
  await ensureEnvFile();
  loadEnv();
  VERBOSE = process.env.VERBOSE === 'true';

  if (!validateRuntimeConfig()) {
    process.exit(1);
  }

  log(`API URL      : ${CMS_API_URL()}`);
  log(`Base URL     : ${SUPABASE_URL() || '(não definida)'}`);
  log(`Device ID    : ${DEVICE_ID() || '(via API key)'}`);
  log(`HTTP Port    : ${HTTP_PORT()}`);
  log(`Intervalo    : ${SYNC_INTERVAL() / 1000}s`);
  log(`Kiosk        : ${FLAG_NO_KIOSK ? 'desativado' : KIOSK_URL()}`);
  log(`Auto-restart : ativado (max ${MAX_RESTARTS} em ${RESTART_WINDOW / 1000}s)`);
  console.log('');

  // Initial HTML fetch
  log('━━━ Buscando HTML publicado ━━━');
  try {
    const result = await fetchHtml();
    if (result.changed && result.html) {
      updateHtmlFile(result.html);
    } else {
      log('ℹ️  Nenhum HTML publicado ainda');
    }
  } catch (err) {
    warn(`Fetch inicial falhou: ${err.message}`);
    if (!fs.existsSync(HTML_FILE())) {
      log('📄 Criando página de espera...');
      fs.writeFileSync(HTML_FILE(),
        `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="10"></head><body style="width:1080px;height:1920px;margin:0;background:#0f172a;display:flex;align-items:center;justify-content:center;font-family:sans-serif;color:#94a3b8"><h1>Aguardando conexão com o Hub...</h1></body></html>`,
        'utf8'
      );
    }
  }

  if (FLAG_SETUP) {
    log('✅ Setup completo!');
    return;
  }

  // Start HTTP server
  log('━━━ Iniciando servidor HTTP ━━━');
  startHttpServer();

  // Open kiosk
  openKiosk();

  // Heartbeat — marca dispositivo como online
  log('💓 Heartbeat ativo (a cada 30s)');
  await sendHeartbeat(); // Envia imediatamente
  const heartbeatInterval = setInterval(sendHeartbeat, 30000);

  // Polling loop
  log('━━━ Polling de atualizações ativo ━━━');
  const pollInterval = setInterval(pollForUpdates, SYNC_INTERVAL());

  // Remote commands — requer API_KEY
  let cmdInterval;
  if (API_KEY() && CMS_API_URL()) {
    log('🔌 Polling de comandos remotos ativo');
    cmdInterval = setInterval(handleRemoteCommand, 5000);
  } else {
    warn('Comandos remotos desativados: defina API_KEY no .env');
  }

  // Graceful shutdown
  function shutdown() {
    log('Encerrando...');
    clearInterval(heartbeatInterval);
    clearInterval(pollInterval);
    if (cmdInterval) clearInterval(cmdInterval);
    setTimeout(() => process.exit(0), 500);
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
