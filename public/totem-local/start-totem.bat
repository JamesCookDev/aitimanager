@echo off
REM ══════════════════════════════════════════════════════════════
REM  TOTEM STARTUP SCRIPT — Windows (.bat)
REM  
REM  Este script faz TUDO automaticamente:
REM    1. Instala Node.js (se necessário) via winget
REM    2. Instala Git (se necessário) via winget
REM    3. Clona o repositório do GitHub (se necessário)
REM    4. Executa o sync-worker.js (sync + servidores + kiosk)
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

echo.
echo ========================================================
echo   TOTEM AITI — Setup Automatico
echo ========================================================
echo.

REM ── FASE 0: Verificar/Instalar Node.js ─────────────────────
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [Setup] Node.js nao encontrado. Instalando...
    
    REM Tentar winget primeiro (Windows 10/11)
    where winget >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        echo [Setup] Instalando Node.js via winget...
        winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements -h
        if %ERRORLEVEL% neq 0 (
            echo [Setup] ERRO: Falha ao instalar Node.js via winget.
            echo [Setup] Instale manualmente: https://nodejs.org
            pause
            exit /b 1
        )
        echo [Setup] Node.js instalado! Reiniciando script para aplicar PATH...
        echo.
        REM Recarregar PATH
        call refreshenv >nul 2>nul
        REM Se refreshenv não existir, reiniciar o script
        where node >nul 2>nul
        if %ERRORLEVEL% neq 0 (
            echo [Setup] PATH ainda nao atualizado.
            echo [Setup] Feche e abra novamente este script, ou reinicie o PC.
            pause
            exit /b 0
        )
    ) else (
        echo.
        echo ╔══════════════════════════════════════════════════╗
        echo ║  Node.js nao encontrado e winget indisponivel!  ║
        echo ║  Instale manualmente: https://nodejs.org        ║
        echo ╚══════════════════════════════════════════════════╝
        echo.
        pause
        exit /b 1
    )
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [Setup] Node.js %NODE_VER% OK

REM ── FASE 0.5: Verificar/Instalar Git ───────────────────────
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [Setup] Git nao encontrado. Instalando...
    
    where winget >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        echo [Setup] Instalando Git via winget...
        winget install Git.Git --accept-source-agreements --accept-package-agreements -h
        if %ERRORLEVEL% neq 0 (
            echo [Setup] ERRO: Falha ao instalar Git via winget.
            echo [Setup] Instale manualmente: https://git-scm.com
            pause
            exit /b 1
        )
        echo [Setup] Git instalado! Reiniciando para aplicar PATH...
        call refreshenv >nul 2>nul
        where git >nul 2>nul
        if %ERRORLEVEL% neq 0 (
            echo [Setup] PATH ainda nao atualizado.
            echo [Setup] Feche e abra novamente este script, ou reinicie o PC.
            pause
            exit /b 0
        )
    ) else (
        echo.
        echo ╔══════════════════════════════════════════════════╗
        echo ║  Git nao encontrado e winget indisponivel!      ║
        echo ║  Instale manualmente: https://git-scm.com       ║
        echo ╚══════════════════════════════════════════════════╝
        echo.
        pause
        exit /b 1
    )
)

for /f "tokens=*" %%i in ('git --version') do set GIT_VER=%%i
echo [Setup] %GIT_VER% OK

REM ── FASE 1: Clonar repositório (se necessário) ─────────────
set REPO_URL=https://github.com/JamesCookDev/Avatar-AI.git
set REPO_BRANCH=feat/escalavel
set APP_DIR=%~dp0app

if not exist "%APP_DIR%\.git" (
    echo.
    echo [Setup] Clonando repositorio...
    echo [Setup] %REPO_URL% (branch: %REPO_BRANCH%)
    
    if exist "%APP_DIR%" (
        echo [Setup] Removendo pasta app antiga...
        rmdir /s /q "%APP_DIR%"
    )
    
    git clone --branch %REPO_BRANCH% --single-branch --depth 1 "%REPO_URL%" "%APP_DIR%"
    
    if %ERRORLEVEL% neq 0 (
        echo [Setup] ERRO: Falha ao clonar repositorio!
        echo [Setup] Verifique a conexao com a internet.
        pause
        exit /b 1
    )
    
    echo [Setup] Repositorio clonado com sucesso!
) else (
    echo [Setup] Repositorio ja existe. Atualizando...
    cd /d "%APP_DIR%"
    git fetch origin %REPO_BRANCH%
    git reset --hard origin/%REPO_BRANCH%
    cd /d "%~dp0"
    echo [Setup] Repositorio atualizado!
)

REM ── FASE 2: Copiar .env para dentro do app (se necessário) ─
if not exist "%APP_DIR%\.env" (
    if exist "%~dp0.env" (
        echo [Setup] Copiando .env para o app...
        copy "%~dp0.env" "%APP_DIR%\.env" >nul
    )
)

echo.
echo ========================================================
echo   TOTEM AITI — Iniciando Worker
echo ========================================================
echo.

REM ── FASE 3: Executar sync-worker dentro do app ─────────────
:start
cd /d "%APP_DIR%"

REM Copiar sync-worker atualizado para dentro do app
if exist "%~dp0sync-worker.js" (
    copy "%~dp0sync-worker.js" "%APP_DIR%\sync-worker.js" >nul
)

node sync-worker.js %*

echo.
echo [Totem] Worker encerrado. Reiniciando em 10s...
timeout /t 10 /nobreak >nul
goto :start
