import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Minimal ZIP builder (no external deps)
function buildZip(files: { name: string; content: Uint8Array }[]): Uint8Array {
  const entries: { name: Uint8Array; content: Uint8Array; offset: number; crc: number }[] = [];
  const chunks: Uint8Array[] = [];
  let offset = 0;

  // CRC32 table
  const crcTable: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    crcTable[i] = c;
  }
  function crc32(buf: Uint8Array): number {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  const encoder = new TextEncoder();

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.content);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);
    
    view.setUint32(0, 0x04034b50, true); // signature
    view.setUint16(4, 20, true); // version needed
    view.setUint16(6, 0, true); // flags
    view.setUint16(8, 0, true); // compression: stored
    view.setUint16(10, 0, true); // mod time
    view.setUint16(12, 0, true); // mod date
    view.setUint32(14, crc, true); // crc32
    view.setUint32(18, file.content.length, true); // compressed size
    view.setUint32(22, file.content.length, true); // uncompressed size
    view.setUint16(26, nameBytes.length, true); // filename length
    view.setUint16(28, 0, true); // extra field length
    localHeader.set(nameBytes, 30);

    entries.push({ name: nameBytes, content: file.content, offset, crc });
    chunks.push(localHeader, file.content);
    offset += localHeader.length + file.content.length;
  }

  // Central directory
  const centralStart = offset;
  for (const entry of entries) {
    const cdHeader = new Uint8Array(46 + entry.name.length);
    const view = new DataView(cdHeader.buffer);
    
    view.setUint32(0, 0x02014b50, true); // signature
    view.setUint16(4, 20, true); // version made by
    view.setUint16(6, 20, true); // version needed
    view.setUint16(8, 0, true); // flags
    view.setUint16(10, 0, true); // compression
    view.setUint16(12, 0, true); // mod time
    view.setUint16(14, 0, true); // mod date
    view.setUint32(16, entry.crc, true); // crc32
    view.setUint32(20, entry.content.length, true); // compressed size
    view.setUint32(24, entry.content.length, true); // uncompressed size
    view.setUint16(28, entry.name.length, true); // filename length
    view.setUint16(30, 0, true); // extra field length
    view.setUint16(32, 0, true); // comment length
    view.setUint16(34, 0, true); // disk start
    view.setUint16(36, 0, true); // internal attrs
    view.setUint32(38, 0, true); // external attrs
    view.setUint32(42, entry.offset, true); // local header offset
    cdHeader.set(entry.name, 46);

    chunks.push(cdHeader);
    offset += cdHeader.length;
  }

  const centralSize = offset - centralStart;

  // End of central directory
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(4, 0, true);
  eocdView.setUint16(6, 0, true);
  eocdView.setUint16(8, entries.length, true);
  eocdView.setUint16(10, entries.length, true);
  eocdView.setUint32(12, centralSize, true);
  eocdView.setUint32(16, centralStart, true);
  eocdView.setUint16(20, 0, true);
  chunks.push(eocd);

  // Concatenate
  const totalSize = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalSize);
  let pos = 0;
  for (const chunk of chunks) {
    result.set(chunk, pos);
    pos += chunk.length;
  }
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Try pre-built ZIP first
    const { data: prebuilt } = await supabase.storage
      .from("agent-dist")
      .download("TotemAgent-Instalador.zip");

    if (prebuilt && prebuilt.size > 1000) {
      const buf = await prebuilt.arrayBuffer();
      return new Response(buf, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="TotemAgent-Instalador.zip"',
        },
      });
    }

    // Fetch agent source from storage
    const { data: agentBlob, error: agentErr } = await supabase.storage
      .from("agent-dist")
      .download("totem-agent.js");

    if (agentErr || !agentBlob) {
      console.error("Failed to fetch agent source:", agentErr);
      return new Response(
        JSON.stringify({ error: "Instalador ainda não disponível. Tente novamente em breve." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const agentSource = await agentBlob.arrayBuffer();
    const encoder = new TextEncoder();

    const installBat = encoder.encode(`@echo off
chcp 65001 >nul
echo.
echo   ══════════════════════════════════════
echo     Instalador do Totem Agent
echo   ══════════════════════════════════════
echo.

set INSTALL_DIR=%ProgramData%\\TotemAgent

echo [1/4] Criando diretório...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo [2/4] Copiando agente...
copy /Y "%~dp0totem-agent.js" "%INSTALL_DIR%\\totem-agent.js" >nul

echo [3/4] Configurando inicio automatico...
echo @echo off > "%INSTALL_DIR%\\start-agent.bat"
echo cd /d "%INSTALL_DIR%" >> "%INSTALL_DIR%\\start-agent.bat"
echo node totem-agent.js >> "%INSTALL_DIR%\\start-agent.bat"
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "TotemAgent" /t REG_SZ /d "\\"%INSTALL_DIR%\\start-agent.bat\\"" /f >nul 2>&1

echo [4/4] Iniciando agente...
start "" "%INSTALL_DIR%\\start-agent.bat"

echo.
echo   Totem Agent instalado com sucesso!
echo   O navegador abrira em instantes para ativar o totem.
echo.
pause
`);

    const uninstallBat = encoder.encode(`@echo off
chcp 65001 >nul
echo.
echo   Desinstalar Totem Agent
echo.
set INSTALL_DIR=%ProgramData%\\TotemAgent
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "TotemAgent" /f >nul 2>&1
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Totem*" >nul 2>&1
if exist "%INSTALL_DIR%" rmdir /S /Q "%INSTALL_DIR%"
echo   Totem Agent removido.
echo.
pause
`);

    const readme = encoder.encode(`Totem Agent - Guia Rapido

1. Execute "instalar.bat" como administrador
2. O navegador abrira com a tela de ativacao
3. Informe o codigo de ativacao da sua organizacao
4. Pronto!

Para desinstalar: execute "desinstalar.bat"
Para suporte: entre em contato pelo painel.
`);

    const zipBytes = buildZip([
      { name: "TotemAgent/totem-agent.js", content: new Uint8Array(agentSource) },
      { name: "TotemAgent/instalar.bat", content: installBat },
      { name: "TotemAgent/desinstalar.bat", content: uninstallBat },
      { name: "TotemAgent/LEIA-ME.txt", content: readme },
    ]);

    return new Response(zipBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="TotemAgent-Instalador.zip"',
        "Content-Length": String(zipBytes.byteLength),
      },
    });
  } catch (err) {
    console.error("agent-download error:", err);
    return new Response(
      JSON.stringify({ error: "Falha ao gerar instalador" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
