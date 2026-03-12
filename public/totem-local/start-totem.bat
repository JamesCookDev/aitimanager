@echo off
REM ══════════════════════════════════════════════════════════════
REM  TOTEM STARTUP SCRIPT — Windows (.bat)
REM
REM  Pré-requisitos: Node.js instalado
REM
REM  Flags opcionais:
REM    start-totem.bat --no-kiosk    (sem abrir navegador)
REM ══════════════════════════════════════════════════════════════

title Totem AITI

cd /d "%~dp0"

echo.
echo ========================================================
echo   TOTEM AITI — Iniciando Worker
echo ========================================================
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [Totem] ERRO: Node.js nao encontrado.
    echo [Totem] Instale manualmente: https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [Totem] Node.js %NODE_VER% OK

REM Loop de restart automático
:start
node sync-worker.js %*

echo.
echo [Totem] Worker encerrado. Reiniciando em 5s...
timeout /t 5 /nobreak >nul
goto :start
