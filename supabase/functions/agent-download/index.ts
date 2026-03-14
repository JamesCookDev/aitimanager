import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { JSZip } from "https://deno.land/x/jszip@0.11.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, apikey, authorization",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Try to serve pre-built ZIP from storage first
    const { data: storageFile } = await supabase.storage
      .from("agent-dist")
      .download("TotemAgent-Instalador.zip");

    if (storageFile && storageFile.size > 1000) {
      const arrayBuffer = await storageFile.arrayBuffer();
      return new Response(arrayBuffer, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="TotemAgent-Instalador.zip"',
          "Content-Length": String(arrayBuffer.byteLength),
        },
      });
    }

    // Fallback: generate a portable installer package on the fly
    const zip = new JSZip();
    const folder = zip.folder("TotemAgent");

    // Install script
    const installBat = `@echo off
chcp 65001 >nul
echo ══════════════════════════════════════
echo   Instalador do Totem Agent
echo ══════════════════════════════════════
echo.

set INSTALL_DIR=%ProgramData%\\TotemAgent
set NODE_DIR=%INSTALL_DIR%\\node

echo [1/5] Criando diretório de instalação...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo [2/5] Copiando agente...
copy /Y "%~dp0totem-agent.js" "%INSTALL_DIR%\\totem-agent.js" >nul

echo [3/5] Verificando Node.js...
where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo       Node.js encontrado no sistema.
    set NODE_CMD=node
) else (
    echo       Baixando Node.js portátil...
    if not exist "%NODE_DIR%" mkdir "%NODE_DIR%"
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.20.4/node-v18.20.4-win-x64.zip' -OutFile '%TEMP%\\node.zip'"
    powershell -Command "Expand-Archive -Path '%TEMP%\\node.zip' -DestinationPath '%TEMP%\\node-extract' -Force"
    xcopy /E /Y /Q "%TEMP%\\node-extract\\node-v18.20.4-win-x64\\*" "%NODE_DIR%\\" >nul
    del /Q "%TEMP%\\node.zip" 2>nul
    rmdir /S /Q "%TEMP%\\node-extract" 2>nul
    set NODE_CMD=%NODE_DIR%\\node.exe
)

echo [4/5] Configurando inicialização automática...
echo @echo off > "%INSTALL_DIR%\\start-agent.bat"
echo cd /d "%INSTALL_DIR%" >> "%INSTALL_DIR%\\start-agent.bat"
if defined NODE_CMD (
    echo %NODE_CMD% totem-agent.js >> "%INSTALL_DIR%\\start-agent.bat"
) else (
    echo node totem-agent.js >> "%INSTALL_DIR%\\start-agent.bat"
)
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "TotemAgent" /t REG_SZ /d "\\"%INSTALL_DIR%\\start-agent.bat\\"" /f >nul 2>&1

echo [5/5] Iniciando agente...
start "" "%INSTALL_DIR%\\start-agent.bat"

echo.
echo ✅ Totem Agent instalado com sucesso!
echo    Diretório: %INSTALL_DIR%
echo    O agente iniciará automaticamente com o Windows.
echo.
echo    O navegador abrirá em instantes para ativar o totem.
echo.
pause
`;

    const uninstallBat = `@echo off
chcp 65001 >nul
echo ══════════════════════════════════════
echo   Desinstalar Totem Agent
echo ══════════════════════════════════════
echo.

set INSTALL_DIR=%ProgramData%\\TotemAgent

echo Removendo do inicio automático...
reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "TotemAgent" /f >nul 2>&1

echo Encerrando agente...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Totem*" >nul 2>&1

echo Removendo arquivos...
if exist "%INSTALL_DIR%" rmdir /S /Q "%INSTALL_DIR%"

echo.
echo ✅ Totem Agent removido.
echo.
pause
`;

    const readme = `# Totem Agent — Guia de Instalação

## Instalação Rápida

1. Execute **instalar.bat** (clique com botão direito → Executar como administrador)
2. O navegador abrirá automaticamente com a tela de ativação
3. Informe o código de ativação da sua organização
4. Pronto! O totem está configurado e funcionando.

## O que acontece na instalação

- O agente é copiado para C:\\ProgramData\\TotemAgent\\
- Se necessário, o Node.js portátil é baixado automaticamente
- O agente é configurado para iniciar com o Windows
- Nenhum software adicional precisa ser instalado manualmente

## Desinstalação

Execute **desinstalar.bat** como administrador.

## Solução de Problemas

**O navegador não abriu?**
Abra manualmente: http://localhost:8080

**O totem não aparece no painel?**
Verifique a conexão com a internet e tente novamente.

**Preciso trocar de organização?**
Delete a pasta C:\\ProgramData\\TotemAgent\\runtime e reinicie.
`;

    // Fetch the latest agent source from the repo/storage
    // For now, we embed it from the edge function's bundled knowledge
    const agentSourceRes = await fetch(
      `${supabaseUrl}/storage/v1/object/public/agent-dist/totem-agent.js`
    );
    
    let agentSource: string;
    if (agentSourceRes.ok) {
      agentSource = await agentSourceRes.text();
    } else {
      // Return error if no agent source is available
      return new Response(
        JSON.stringify({ error: "Agent source not yet uploaded to storage. Please upload totem-agent.js to agent-dist bucket." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    folder!.file("totem-agent.js", agentSource);
    folder!.file("instalar.bat", installBat);
    folder!.file("desinstalar.bat", uninstallBat);
    folder!.file("LEIA-ME.txt", readme);

    const zipContent = await zip.generateAsync({ type: "uint8array" });

    return new Response(zipContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="TotemAgent-Instalador.zip"',
        "Content-Length": String(zipContent.byteLength),
      },
    });
  } catch (err) {
    console.error("agent-download error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate installer package" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
