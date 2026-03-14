#!/usr/bin/env node
/**
 * Prepare distribution package for Windows.
 * 
 * Creates a ready-to-distribute folder at agent/dist/totem-agent-win/
 * containing the .exe, install script, and README.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const DIST_DIR     = path.join(__dirname, '..', 'dist');
const PACKAGE_DIR  = path.join(DIST_DIR, 'totem-agent-win');
const EXE_SRC      = path.join(DIST_DIR, 'totem-agent.exe');

// Ensure dist dir exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ dist/ não encontrado. Execute "npm run build:win" primeiro.');
  process.exit(1);
}

if (!fs.existsSync(EXE_SRC)) {
  console.error('❌ totem-agent.exe não encontrado em dist/. Build falhou?');
  process.exit(1);
}

// Create package directory
if (fs.existsSync(PACKAGE_DIR)) {
  fs.rmSync(PACKAGE_DIR, { recursive: true });
}
fs.mkdirSync(PACKAGE_DIR, { recursive: true });

// Copy executable
fs.copyFileSync(EXE_SRC, path.join(PACKAGE_DIR, 'totem-agent.exe'));

// Create install.bat — adds to Windows startup and runs
const installBat = `@echo off
chcp 65001 >nul
echo ══════════════════════════════════════
echo   Instalador do Totem Agent
echo ══════════════════════════════════════
echo.

set INSTALL_DIR=%ProgramData%\\TotemAgent
set EXE_NAME=totem-agent.exe

echo [1/4] Criando diretório de instalação...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo [2/4] Copiando agente...
copy /Y "%~dp0%EXE_NAME%" "%INSTALL_DIR%\\%EXE_NAME%" >nul

echo [3/4] Configurando inicialização automática...
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "TotemAgent" /t REG_SZ /d "\\"%INSTALL_DIR%\\%EXE_NAME%\\"" /f >nul 2>&1

echo [4/4] Iniciando agente...
start "" "%INSTALL_DIR%\\%EXE_NAME%"

echo.
echo ✅ Totem Agent instalado com sucesso!
echo    Diretório: %INSTALL_DIR%
echo    O agente iniciará automaticamente com o Windows.
echo.
echo    Abra o navegador para ativar o totem.
echo.
pause
`;
fs.writeFileSync(path.join(PACKAGE_DIR, 'instalar.bat'), installBat, { encoding: 'utf8' });

// Create uninstall.bat
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
taskkill /F /IM totem-agent.exe >nul 2>&1

echo Removendo arquivos...
if exist "%INSTALL_DIR%" rmdir /S /Q "%INSTALL_DIR%"

echo.
echo ✅ Totem Agent removido.
echo.
pause
`;
fs.writeFileSync(path.join(PACKAGE_DIR, 'desinstalar.bat'), uninstallBat, { encoding: 'utf8' });

// Create README
const readme = `# Totem Agent — Guia de Instalação

## Instalação Rápida

1. Execute **instalar.bat** como administrador
2. O navegador abrirá automaticamente com a tela de ativação
3. Informe o código de ativação da sua organização
4. Pronto! O totem está configurado.

## O que acontece na instalação

- O agente é copiado para \`C:\\ProgramData\\TotemAgent\\
- É configurado para iniciar automaticamente com o Windows
- A pasta \`runtime/\` é criada ao lado do executável com os dados do dispositivo

## Desinstalação

Execute **desinstalar.bat** como administrador.

## Solução de Problemas

**O navegador não abriu?**
Abra manualmente: http://localhost:8080

**O totem não aparece no painel?**
Verifique a conexão com a internet e tente novamente.

**Preciso trocar de organização?**
Execute o agente com --reset ou delete a pasta runtime/ e reinicie.
`;
fs.writeFileSync(path.join(PACKAGE_DIR, 'LEIA-ME.txt'), readme, { encoding: 'utf8' });

console.log('');
console.log('✅ Pacote de distribuição criado em:');
console.log('   ' + PACKAGE_DIR);
console.log('');
console.log('Conteúdo:');
const files = fs.readdirSync(PACKAGE_DIR);
files.forEach(f => console.log('   📄 ' + f));
console.log('');
console.log('Próximos passos:');
console.log('   1. Comprima a pasta totem-agent-win/ em .zip');
console.log('   2. Distribua o .zip para o cliente');
console.log('   3. Cliente executa instalar.bat');
console.log('');
