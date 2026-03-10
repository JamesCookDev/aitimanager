@echo off
REM ══════════════════════════════════════════════════════════════
REM  TOTEM STARTUP SCRIPT — Windows (.bat)
REM  
REM  Este script inicia o totem completo:
REM    1. Sincroniza arquivos do Hub
REM    2. Instala dependências (se necessário)
REM    3. Inicia frontend (Vite :5173) + backend (Node :3000)
REM    4. Abre navegador em modo kiosk (tela cheia sem barras)
REM
REM  Para iniciar automaticamente com o Windows:
REM    1. Win+R → shell:startup
REM    2. Copie um atalho deste .bat para a pasta que abrir
REM
REM  Flags opcionais:
REM    start-totem.bat --no-kiosk    (sem abrir navegador)
REM    start-totem.bat --setup       (apenas instalar, sem rodar)
REM ══════════════════════════════════════════════════════════════

title Totem AITI - Inicializando...

REM Navegar para o diretório do script
cd /d "%~dp0"

REM Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo.
    echo ╔══════════════════════════════════════════════╗
    echo ║  ❌ Node.js nao encontrado!                  ║
    echo ║  Instale em: https://nodejs.org              ║
    echo ╚══════════════════════════════════════════════╝
    echo.
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════╗
echo ║  🤖 TOTEM AITI — Iniciando...                ║
echo ╚══════════════════════════════════════════════╝
echo.

REM Executar o sync-worker (ele cuida de tudo)
node sync-worker.js %*

REM Se o worker encerrar, aguardar antes de fechar
echo.
echo [Totem] Worker encerrado. Reiniciando em 10s...
timeout /t 10 /nobreak >nul
goto :start

:start
node sync-worker.js %*
goto :start
