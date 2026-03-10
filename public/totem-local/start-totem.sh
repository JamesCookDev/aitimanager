#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  TOTEM STARTUP SCRIPT — Linux/macOS (.sh)
#
#  Este script inicia o totem completo:
#    1. Sincroniza arquivos do Hub
#    2. Instala dependências (se necessário)
#    3. Inicia frontend (Vite :5173) + backend (Node :3000)
#    4. Abre navegador em modo kiosk (tela cheia sem barras)
#
#  Para iniciar automaticamente no boot (Linux):
#    - Crie um serviço systemd ou adicione ao autostart do desktop
#    - Veja instruções no final deste arquivo
#
#  Flags opcionais:
#    ./start-totem.sh --no-kiosk    (sem abrir navegador)
#    ./start-totem.sh --setup       (apenas instalar, sem rodar)
# ══════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo ""
    echo "╔══════════════════════════════════════════════╗"
    echo "║  ❌ Node.js não encontrado!                  ║"
    echo "║  Instale: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - ║"
    echo "║  sudo apt-get install -y nodejs              ║"
    echo "╚══════════════════════════════════════════════╝"
    echo ""
    exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  🤖 TOTEM AITI — Iniciando...                ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Loop de restart automático
while true; do
    node sync-worker.js "$@"
    
    echo ""
    echo "[Totem] Worker encerrado. Reiniciando em 10s..."
    sleep 10
done

# ══════════════════════════════════════════════════════════════
#  AUTOSTART COM SYSTEMD (Linux):
#
#  sudo tee /etc/systemd/system/totem.service << EOF
#  [Unit]
#  Description=Totem AITI
#  After=network.target
#
#  [Service]
#  Type=simple
#  User=$USER
#  WorkingDirectory=$SCRIPT_DIR
#  ExecStart=/bin/bash $SCRIPT_DIR/start-totem.sh
#  Restart=always
#  RestartSec=10
#  Environment=DISPLAY=:0
#
#  [Install]
#  WantedBy=multi-user.target
#  EOF
#
#  sudo systemctl enable totem
#  sudo systemctl start totem
# ══════════════════════════════════════════════════════════════
