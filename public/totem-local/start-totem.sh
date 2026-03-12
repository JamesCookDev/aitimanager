#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  TOTEM STARTUP SCRIPT — Linux/macOS (.sh)
#
#  Pré-requisitos: Node.js instalado
#
#  Flags opcionais:
#    ./start-totem.sh --no-kiosk    (sem abrir navegador)
# ══════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "========================================================"
echo "  TOTEM AITI — Iniciando Worker"
echo "========================================================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "[Totem] ERRO: Node.js não encontrado."
    echo "[Totem] Instale manualmente: https://nodejs.org"
    exit 1
fi

echo "[Totem] Node.js $(node --version) OK"

# Loop de restart automático
while true; do
    node sync-worker.js "$@"
    
    echo ""
    echo "[Totem] Worker encerrado. Reiniciando em 5s..."
    sleep 5
done
